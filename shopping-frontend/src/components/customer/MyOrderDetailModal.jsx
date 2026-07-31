import React from 'react';
import { Package, X } from 'lucide-react';

export default function MyOrderDetailModal({ isOpen, loading, order, onClose }) {
  if (!isOpen) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : 'N/A';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">
              Order Receipt {order ? `#${order.id}` : ''}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading order receipt details...
          </div>
        ) : !order ? (
          <div className="p-8 text-center text-rose-400 text-sm">
            Order details unavailable
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Order ID</p>
                <p className="font-mono font-bold text-indigo-400 text-sm">#{order.id}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {order.status || 'PAID'}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Created At</p>
                <p className="font-semibold text-white text-xs">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Purchased Products</h4>
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

            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
              <span className="text-xs font-bold text-slate-300">Grand Total:</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
