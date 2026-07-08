import React from 'react';
import Link from 'next/link';
import { getWorkOrderById } from '@/lib/data-store';
import { notFound } from 'next/navigation';
import WorkOrderForm from '@/components/work-order-form';
import { ArrowLeft } from 'lucide-react';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Work Order | FixFlow',
};

export default async function EditWorkOrderPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const order = await getWorkOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href={`/${order.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Work Order Details
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">Edit</span>
      </nav>

      <div className="space-y-2">
        <Link
          href={`/${order.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Edit Work Order
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modify the properties, priority, or execution status of this task.
        </p>
      </div>

      <WorkOrderForm initialData={order} isEdit={true} />
    </div>
  );
}
