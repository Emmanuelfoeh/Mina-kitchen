'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteMenuItemButtonProps {
  itemId: string;
  itemName: string;
}

export function DeleteMenuItemButton({
  itemId,
  itemName,
}: DeleteMenuItemButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect to menu list
        router.push('/admin/menu');
      } else {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Delete menu item error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete menu item'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2 text-red-600 hover:text-red-700"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
