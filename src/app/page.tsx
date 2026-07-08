import React from 'react';
import Link from 'next/link';
import { getWorkOrders, WorkOrder } from '@/lib/data-store';
import DashboardFilters from '@/components/dashboard-filters';
import DeleteButton from '@/components/delete-button';
import { 
  PlusCircle, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  Eye, 
  Edit,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
  }>;
}

// Ensure the page fetches dynamic data on every request
export const dynamic = 'force-dynamic';

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.toLowerCase() || '';
  const status = resolvedSearchParams.status || '';
  const priority = resolvedSearchParams.priority || '';

  // Fetch all orders to compute aggregate statistics
  const allOrders = await getWorkOrders();

  // Compute stats
  const totalCount = allOrders.length;
  const openCount = allOrders.filter(o => o.status === 'Open').length;
  const inProgressCount = allOrders.filter(o => o.status === 'In Progress').length;
  const doneCount = allOrders.filter(o => o.status === 'Done').length;

  // Filter list based on search parameters
  let filteredOrders = [...allOrders];

  if (q) {
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
    );
  }

  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }

  if (priority) {
    filteredOrders = filteredOrders.filter(o => o.priority === priority);
  }

  // Sort by updatedAt descending
  filteredOrders.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Technician Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor, prioritize, and update active hardware and facility maintenance tasks.
          </p>
        </div>
        <Link
          href="/new"
          id="dashboard-new-order-button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Create Work Order
        </Link>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Queue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">orders</span>
          </div>
        </div>

        {/* Open Stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{openCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">awaiting start</span>
          </div>
        </div>

        {/* In Progress Stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{inProgressCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">active</span>
          </div>
        </div>

        {/* Done Stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Done</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{doneCount}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}% rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filters Component */}
      <DashboardFilters />

      {/* 4. Work Orders List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-400 mb-4 border border-slate-100 dark:border-slate-900">
              <ListTodo className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No work orders found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {allOrders.length === 0 
                ? "No work orders exist in the database. Seed the sample data or create one to get started." 
                : "No orders match your filter criteria. Try adjusting or clearing your search queries."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {allOrders.length === 0 ? (
                <Link
                  href="/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Work Order
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  Reset All Filters
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* List of Work Orders */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 w-[45%]">Work Order Title</th>
                    <th className="py-4 px-6 w-[15%]">Priority</th>
                    <th className="py-4 px-6 w-[15%]">Status</th>
                    <th className="py-4 px-6 w-[15%]">Updated At</th>
                    <th className="py-4 px-6 text-right w-[10%] min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group"
                    >
                      <td className="py-4.5 px-6">
                        <Link 
                          href={`/${order.id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block truncate transition-colors"
                          title="View Details"
                        >
                          {order.title}
                        </Link>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block truncate mt-0.5" title={order.description}>
                          {order.description || "No description provided"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          order.priority === 'High' 
                            ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-500/20' 
                            : order.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-800 ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-500/20'
                            : 'bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-800/50 dark:text-slate-400 dark:ring-slate-500/10'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            order.priority === 'High' 
                              ? 'bg-red-600' 
                              : order.priority === 'Medium' 
                              ? 'bg-amber-500' 
                              : 'bg-slate-400'
                          }`} />
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          order.status === 'Done' 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-500/20'
                            : order.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-500/30'
                            : 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-950/30 dark:text-indigo-400 dark:ring-indigo-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDate(order.updatedAt)}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/${order.id}`}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/${order.id}/edit`}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteButton id={order.id} title={order.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/${order.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2"
                    >
                      {order.title}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/${order.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={order.id} title={order.title} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {order.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {/* Priority Badges */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        order.priority === 'High' 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' 
                          : order.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                      }`}>
                        {order.priority}
                      </span>

                      {/* Status Badges */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        order.status === 'Done' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : order.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Updated: {formatDate(order.updatedAt)}
                    </span>
                  </div>

                  <Link 
                    href={`/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-1"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
