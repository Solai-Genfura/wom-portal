import React from 'react';
import Link from 'next/link';
import { getWorkOrderById } from '@/lib/data-store';
import DeleteButton from '@/components/delete-button';
import CopyButton from '@/components/copy-button';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  AlertTriangle,
  FileText,
  Clock,
  Edit,
  Clipboard,
  CheckCircle2
} from 'lucide-react';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export default async function WorkOrderDetailPage({ params }: DetailPageProps) {
  const resolvedParams = await params;
  const order = await getWorkOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Breadcrumbs / Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">Work Order Details</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${order.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4" />
            Edit Order
          </Link>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm hover:border-red-200 dark:hover:border-red-950 transition-colors">
            <DeleteButton id={order.id} title={order.title} />
          </div>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Title & Description */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {/* Priority Badges */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                order.priority === 'High' 
                  ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/30 dark:text-red-400' 
                  : order.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-800 ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-800/50 dark:text-slate-400'
              }`}>
                {order.priority} Priority
              </span>

              {/* Status Badges */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                order.status === 'Done' 
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : order.status === 'In Progress'
                  ? 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-950/30 dark:text-indigo-400'
              }`}>
                {order.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {order.title}
            </h1>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-3">
              <FileText className="h-4 w-4" />
              Description
            </h3>
            {/* Render safely preserving formatting without dangerouslySetInnerHTML */}
            <div className="whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              {order.description || <span className="text-slate-400 italic">No description provided for this work order.</span>}
            </div>
          </div>
        </div>

        {/* Right column: Meta details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 self-start">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Metadata Details
          </h2>

          <div className="space-y-4 text-xs">
            {/* ID Field */}
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Work Order ID</span>
              <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-850">
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate select-all">{order.id}</span>
                <CopyButton text={order.id} />
              </div>
            </div>

            {/* Priority Details */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-slate-400" />
                Priority
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.priority}</span>
            </div>

            {/* Status Details */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Status
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.status}</span>
            </div>

            {/* Updated At Details */}
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Last Updated
              </span>
              <span className="font-semibold text-slate-900 dark:text-white text-right">{formatDate(order.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
