import React from 'react';
import { Package, X } from 'lucide-react';

export default function AdminOrderDetailModal({ isOpen, loading, order, onClose }) {
  if (!isOpen) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : 'N/A';

  const renderStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 animate-fadeIn">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">
              Order Details #{order ? order.id : ''}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading order receipt details...</div>
          ) : !order ? (
            <div className="py-12 text-center text-rose-400">Order information unavailable.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Order ID</p>
                  <p className="font-mono font-bold text-indigo-400 text-sm">#{order.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Customer</p>
                  <p className="font-bold text-white text-xs">{order.user_name || order.full_name || `User #${order.user_id}`}</p>
                  <p className="text-[10px] text-slate-400">{order.user_email || `ID: ${order.user_id}`}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Status</p>
                  <div className="mt-0.5">{renderStatusBadge(order.status || 'PAID')}</div>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Order Date</p>
                  <p className="font-medium text-slate-200">{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Purchased Items</h4>
                <div className="border border-slate-700/60 rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700/60">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/60">
                          <td className="py-3 px-3">
                            <p className="font-medium text-white">{item.product_name || `Product #${item.product_id}`}</p>
                            <p className="text-[10px] text-slate-500">ID: #{item.product_id}</p>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-300">x{item.quantity}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                <span className="font-bold text-white">Total Order Amount:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
