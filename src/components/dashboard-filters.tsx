'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, Loader2, RefreshCw } from 'lucide-react';

export default function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for search input to allow debouncing
  const [q, setQ] = useState(searchParams.get('q') || '');

  // Synchronize input value with URL search params changes (e.g., reset, browser navigation)
  useEffect(() => {
    setQ(searchParams.get('q') || '');
  }, [searchParams]);

  const updateFilters = (newFilters: { q?: string; status?: string; priority?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined) return;
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Debounce search query update
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (q !== (searchParams.get('q') || '')) {
        updateFilters({ q });
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [q]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ priority: e.target.value });
  };

  const handleClear = () => {
    setQ('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = searchParams.get('q') || searchParams.get('status') || searchParams.get('priority');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>Filter Work Orders</span>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
        </h2>
        {hasFilters && (
          <button
            onClick={handleClear}
            disabled={isPending}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Text Search */}
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">Search Work Orders</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description..."
            className="block w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
          <select
            id="status-filter"
            value={searchParams.get('status') || ''}
            onChange={handleStatusChange}
            disabled={isPending}
            className="block w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority-filter" className="sr-only">Filter by Priority</label>
          <select
            id="priority-filter"
            value={searchParams.get('priority') || ''}
            onChange={handlePriorityChange}
            disabled={isPending}
            className="block w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>
    </div>
  );
}
