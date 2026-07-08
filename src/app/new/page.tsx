import React from 'react';
import Link from 'next/link';
import WorkOrderForm from '@/components/work-order-form';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Work Order | FixFlow',
};

export default function NewWorkOrderPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">New Work Order</span>
      </nav>

      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create New Work Order
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Open a new maintenance request in the queue. Fields marked with an asterisk (<span className="text-red-500">*</span>) are required.
        </p>
      </div>

      <WorkOrderForm />
    </div>
  );
}
