'use client';

import React, { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  id: string;
  title: string;
}

export default function DeleteButton({ id, title }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/work-orders/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Failed to delete work order.');
          return;
        }

        // Successfully deleted, refresh page to get updated server-side state
        router.refresh();
      } catch (error) {
        console.error('Delete error:', error);
        alert('An unexpected error occurred while deleting the work order.');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      aria-label={`Delete work order ${title}`}
      title="Delete Work Order"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
