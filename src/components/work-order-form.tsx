'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkOrder } from '@/lib/data-store';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface WorkOrderFormProps {
  initialData?: WorkOrder;
  isEdit?: boolean;
}

export default function WorkOrderForm({ initialData, isEdit = false }: WorkOrderFormProps) {
  const router = useRouter();
  
  // Field states
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<WorkOrder['priority']>(initialData?.priority || 'Medium');
  const [status, setStatus] = useState<WorkOrder['status']>(initialData?.status || 'Open');

  // Request & validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    // 1. Client-Side Validation
    const clientErrors: Record<string, string> = {};
    if (title.trim().length < 2) {
      clientErrors.title = 'Title must be at least 2 characters.';
    } else if (title.length > 80) {
      clientErrors.title = 'Title must be at most 80 characters.';
    }

    if (description.length > 2000) {
      clientErrors.description = 'Description must be at most 2000 characters.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);
      return;
    }

    // 2. Submit Payload to API
    try {
      const url = isEdit && initialData 
        ? `/api/work-orders/${initialData.id}` 
        : '/api/work-orders';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? { title, description, priority, status }
        : { title, description, priority };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          // Field-level errors from Zod server-side validation
          setErrors(data.errors);
        } else {
          setGeneralError(data.error || 'Failed to save work order. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Navigate back and refresh Server state
      router.refresh();
      if (isEdit && initialData) {
        router.push(`/${initialData.id}`);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Work order save error:', error);
      setGeneralError('Network error. Failed to save work order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
      {generalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label 
            htmlFor="title" 
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Work Order Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Replace lobby AC filtration system"
            className={`block w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 outline-none transition-all ${
              errors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-1.5">
          <label 
            htmlFor="description" 
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Detailed Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Provide context, locations, parts needed, or special technician instructions..."
            className={`block w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 outline-none transition-all resize-y min-h-[100px] ${
              errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            aria-invalid={errors.description ? "true" : "false"}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
            {errors.description ? (
              <p id="description-error" className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="text-[10px] font-mono select-none">
              {description.length} / 2,000 chars
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority Select */}
          <div className="space-y-1.5">
            <label 
              htmlFor="priority" 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Priority level <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as WorkOrder['priority'])}
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status Select (Only Visible when Editing) */}
          {isEdit && (
            <div className="space-y-1.5">
              <label 
                htmlFor="status" 
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkOrder['status'])}
                disabled={isSubmitting}
                className="block w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-end gap-3">
          <Link
            href={isEdit && initialData ? `/${initialData.id}` : '/'}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Work Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
