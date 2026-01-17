import { redirect } from 'next/navigation';

interface MenuItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Redirect to the view page by default
export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { id } = await params;

  // Redirect to view page
  redirect(`/admin/menu/${id}/view`);
}
