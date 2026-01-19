import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

// Helper function to generate unique slug (excluding current package)
async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (true) {
    const existingPackage = await db.package.findUnique({
      where: { slug },
    });

    if (!existingPackage || (excludeId && existingPackage.id === excludeId)) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

const packageUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  includedItems: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().min(1),
        includedCustomizations: z.array(z.string()).default([]),
      })
    )
    .optional(),
});

// GET /api/admin/packages/[id] - Get single package for admin
export const GET = requireAdmin(
  async (
    _request: NextRequest,
    _user: AuthUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Package ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      const packageData = await db.package.findUnique({
        where: { id },
        include: {
          includedItems: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!packageData) {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        );
      }

      // Transform package to match frontend expectations
      const transformedPackage = {
        ...packageData,
        type: packageData.type.toLowerCase() as 'daily' | 'weekly' | 'monthly',
        features:
          typeof packageData.features === 'string'
            ? JSON.parse(packageData.features)
            : packageData.features,
        includedItems: packageData.includedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          includedCustomizations:
            typeof item.includedCustomizations === 'string'
              ? JSON.parse(item.includedCustomizations)
              : item.includedCustomizations,
        })),
      };

      return NextResponse.json({
        success: true,
        data: transformedPackage,
      });
    } catch (error) {
      console.error('Get package error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch package' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/admin/packages/[id] - Update package
export const PUT = requireAdmin(
  async (
    request: NextRequest,
    _user: AuthUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Package ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;
      const body = await request.json();
      const validatedData = packageUpdateSchema.parse(body);

      // Check if package exists
      const existingPackage = await db.package.findUnique({
        where: { id },
        include: { includedItems: true },
      });

      if (!existingPackage) {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        );
      }

      // Update package in transaction
      const updatedPackage = await db.$transaction(async (tx) => {
        // Delete existing package items if new ones are provided
        if (validatedData.includedItems) {
          await tx.packageItem.deleteMany({
            where: { packageId: id },
          });
        }

        // Generate new slug if name is being updated
        let newSlug: string | undefined;
        if (validatedData.name && validatedData.name !== existingPackage.name) {
          newSlug = await generateUniqueSlug(validatedData.name, id);
        }

        // Update package
        const updated = await tx.package.update({
          where: { id },
          data: {
            ...(validatedData.name && { name: validatedData.name }),
            ...(newSlug && { slug: newSlug }),
            ...(validatedData.description && {
              description: validatedData.description,
            }),
            ...(validatedData.type && { type: validatedData.type }),
            ...(validatedData.price !== undefined && {
              price: validatedData.price,
            }),
            ...(validatedData.image !== undefined && {
              image: validatedData.image,
            }),
            ...(validatedData.isActive !== undefined && {
              isActive: validatedData.isActive,
            }),
            ...(validatedData.features && {
              features: JSON.stringify(validatedData.features),
            }),
            ...(validatedData.seoTitle !== undefined && {
              seoTitle: validatedData.seoTitle,
            }),
            ...(validatedData.seoDescription !== undefined && {
              seoDescription: validatedData.seoDescription,
            }),
            // Create new package items if provided
            ...(validatedData.includedItems && {
              includedItems: {
                create: validatedData.includedItems.map((item) => ({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                  includedCustomizations: JSON.stringify(
                    item.includedCustomizations
                  ),
                })),
              },
            }),
          },
          include: {
            includedItems: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });

        return updated;
      });

      // Transform response to match frontend expectations
      const transformedPackage = {
        ...updatedPackage,
        type: updatedPackage.type.toLowerCase() as
          | 'daily'
          | 'weekly'
          | 'monthly',
        features: JSON.parse(updatedPackage.features as string),
        includedItems: updatedPackage.includedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          includedCustomizations: JSON.parse(
            item.includedCustomizations as string
          ),
        })),
      };

      return NextResponse.json({
        success: true,
        data: transformedPackage,
        message: 'Package updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues,
          },
          { status: 400 }
        );
      }

      console.error('Update package error:', error);
      return NextResponse.json(
        { error: 'Failed to update package' },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/admin/packages/[id] - Partial update (e.g., status change)
export const PATCH = requireAdmin(
  async (
    request: NextRequest,
    _user: AuthUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Package ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;
      const body = await request.json();

      const updatedPackage = await db.package.update({
        where: { id },
        data: body,
        include: {
          includedItems: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Transform response to match frontend expectations
      const transformedPackage = {
        ...updatedPackage,
        type: updatedPackage.type.toLowerCase() as
          | 'daily'
          | 'weekly'
          | 'monthly',
        features:
          typeof updatedPackage.features === 'string'
            ? JSON.parse(updatedPackage.features)
            : updatedPackage.features,
        includedItems: updatedPackage.includedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          includedCustomizations:
            typeof item.includedCustomizations === 'string'
              ? JSON.parse(item.includedCustomizations)
              : item.includedCustomizations,
        })),
      };

      return NextResponse.json({
        success: true,
        data: transformedPackage,
        message: 'Package updated successfully',
      });
    } catch (error) {
      console.error('Patch package error:', error);
      return NextResponse.json(
        { error: 'Failed to update package' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/packages/[id] - Delete package
export const DELETE = requireAdmin(
  async (
    _request: NextRequest,
    _user: AuthUser,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          { error: 'Package ID is required' },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      // Check if package exists
      const existingPackage = await db.package.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        );
      }

      // Delete package (cascade will handle package items)
      await db.package.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Package deleted successfully',
      });
    } catch (error) {
      console.error('Delete package error:', error);
      return NextResponse.json(
        { error: 'Failed to delete package' },
        { status: 500 }
      );
    }
  }
);
