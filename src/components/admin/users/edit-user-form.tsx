'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EditUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'CUSTOMER' | 'ADMIN';
    isVerified: boolean;
    createdAt: string;
    _count: {
      orders: number;
      addresses: number;
    };
  };
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserFormData>({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    isVerified: user.isVerified,
  });

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          isVerified: formData.isVerified,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect back to user profile
        router.push(`/admin/customers/${user.id}`);
        router.refresh();
      } else {
        if (data.error === 'Email is already taken') {
          setErrors({ email: 'This email is already registered' });
        } else {
          setErrors({ general: data.error || 'Failed to update user' });
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrors({ general: 'Failed to update user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: 'toggleStatus' | 'toggleRole') => {
    setLoading(true);
    try {
      let updateData: Partial<UserFormData> = {};

      if (action === 'toggleStatus') {
        updateData.isVerified = !formData.isVerified;
      } else if (action === 'toggleRole') {
        updateData.role = formData.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Update local state
        setFormData(prev => ({ ...prev, ...updateData }));
      } else {
        const data = await response.json();
        setErrors({ general: data.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrors({ general: 'Failed to update user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const roleColors = {
    CUSTOMER: 'bg-blue-100 text-blue-700 border-blue-200',
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const statusColors = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Badge variant="outline" className={roleColors[formData.role]}>
              {formData.role === 'ADMIN' && <Shield className="mr-1 h-3 w-3" />}
              {formData.role}
            </Badge>
            <Badge
              variant="outline"
              className={
                formData.isVerified
                  ? statusColors.verified
                  : statusColors.pending
              }
            >
              {formData.isVerified ? 'Active' : 'Pending'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Orders:</span>
              <span className="ml-2 font-medium">{user._count.orders}</span>
            </div>
            <div>
              <span className="text-gray-500">Saved Addresses:</span>
              <span className="ml-2 font-medium">{user._count.addresses}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('toggleStatus')}
              disabled={loading}
              className="gap-2"
            >
              {formData.isVerified ? (
                <>
                  <UserX className="h-4 w-4" />
                  Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Activate User
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAction('toggleRole')}
              disabled={loading}
              className="gap-2"
            >
              {formData.role === 'ADMIN' ? (
                <>
                  <ShieldOff className="h-4 w-4" />
                  Remove Admin
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Make Admin
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-300' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number (optional)"
                className={errors.phone ? 'border-red-300' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissions & Access</h3>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'CUSTOMER' | 'ADMIN') =>
                    handleInputChange('role', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Administrators have full access to the admin panel and can
                  manage all aspects of the platform.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={formData.isVerified}
                  onCheckedChange={checked =>
                    handleInputChange('isVerified', checked as boolean)
                  }
                />
                <Label htmlFor="isVerified" className="text-sm">
                  Account is active and verified
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
