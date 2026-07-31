import React from 'react';
import { Package, Eye, RefreshCw } from 'lucide-react';

export default function MyOrdersList({ orders, loading, onFetchOrders, onOpenDetail }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl p-6 space-y-4 animate-fadeIn">
      {/* Header inside the table block */}
      <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" /> My Order History
          </h2>
          <p className="text-xs text-slate-400">View all orders placed with your account</p>
        </div>
        <button
          onClick={onFetchOrders}
          className="p-2 bg-slate-900/60 border border-slate-700 rounded-xl hover:bg-slate-700/50 transition"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Loading your order history...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No orders placed yet
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/80 transition">
                  <td className="p-4 font-mono font-bold text-indigo-400">#{ord.id}</td>
                  <td className="p-4 text-slate-300 text-xs">{formatDate(ord.created_at)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs rounded-full font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {ord.status || 'PAID'}
                    </span>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold">
                    {formatCurrency(ord.total_amount)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onOpenDetail(ord.id)}
                      className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl transition text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
