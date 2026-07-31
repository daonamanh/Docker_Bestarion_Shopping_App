import React from 'react';
import {
  Package, Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2,
  ArrowUpDown, RefreshCw
} from 'lucide-react';

export default function ProductManagement({
  products,
  pagination,
  loadingProducts,
  search,
  setSearch,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  order,
  setOrder,
  onFetchProducts,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteProduct,
  onPageChange
}) {
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Management</h1>
          <p className="text-xs text-slate-400">Create, edit, view inventory, and delete products</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-4 flex gap-2">
          <input
            type="number"
            placeholder="Price from"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white"
          />
          <input
            type="number"
            placeholder="Price to"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <div className="md:col-span-4 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-slate-300"
          >
            <option value="created_at">Newest</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-slate-900/60 border border-slate-700 rounded-xl hover:bg-slate-700/50"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={onFetchProducts}
            className="p-2 bg-slate-900/60 border border-slate-700 rounded-xl hover:bg-slate-700/50"
            title="Reload products"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loadingProducts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bảng Dữ Liệu Sản Phẩm */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
              <tr>
                <th className="p-4 w-16">Picture</th>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loadingProducts ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading product list...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/80 transition">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`items-center justify-center text-slate-600 ${product.image_url ? 'hidden' : 'flex'}`}>
                          <Package className="w-5 h-5 stroke-1" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">{product.name}</td>
                    <td className="p-4 text-emerald-400 font-bold">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4 text-slate-300">{product.stock}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onOpenEditModal(product)}
                        className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id, product.name)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-700/60 flex justify-between items-center text-xs text-slate-400">
          <span>Total: {pagination.total} products</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} / {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
