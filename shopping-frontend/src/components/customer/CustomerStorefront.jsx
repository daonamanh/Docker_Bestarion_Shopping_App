import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL, getAuthHeaders } from '../../config';
import ProductCatalog from './ProductCatalog';
import ShoppingCartComponent from './ShoppingCart';
import MyOrdersList from './MyOrdersList';
import MyOrderDetailModal from './MyOrderDetailModal';

export default function CustomerStorefront() {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'my_orders'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: false });

  // Order history states
  const [myOrders, setMyOrders] = useState([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);
  const [selectedMyOrder, setSelectedMyOrder] = useState(null);
  const [loadingMyOrderDetail, setLoadingMyOrderDetail] = useState(false);
  const [isMyOrderModalOpen, setIsMyOrderModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products?limit=100`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const sortedItems = (data || []).sort((a, b) => (a.id || 0) - (b.id || 0));
        setCart(sortedItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const fetchMyOrders = useCallback(async () => {
    setLoadingMyOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/my/orders`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data || []);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoadingMyOrders(false);
    }
  }, []);

  const fetchMyOrderDetail = async (orderId) => {
    setIsMyOrderModalOpen(true);
    setLoadingMyOrderDetail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/my/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMyOrder(data);
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Cannot view order receipt');
        setIsMyOrderModalOpen(false);
      }
    } catch (err) {
      toast.error('Connection error while fetching receipt');
      setIsMyOrderModalOpen(false);
    } finally {
      setLoadingMyOrderDetail(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  useEffect(() => {
    if (activeTab === 'my_orders') {
      fetchMyOrders();
    }
  }, [activeTab, fetchMyOrders]);

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      if (res.ok) {
        toast.success(`🛒 Added "${product.name}" to cart!`);
        await fetchCart();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to add product to cart');
      }
    } catch (err) {
      toast.error('Connection error while adding item to cart');
    } finally {
      setAddingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutStatus({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Checkout failed');
        return;
      }

      const orderId = data.order?.id || data.id;
      toast.success(`🎉 Checkout successful! Order #${orderId}`);
      await fetchCart();
      await fetchProducts();
      await fetchMyOrders();
    } catch (err) {
      toast.error('Connection error during checkout');
    } finally {
      setCheckoutStatus({ loading: false });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header card containing Product Store title, Shop Catalog & My Orders buttons, and Cart badge on the same line */}
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Store</h1>
          <p className="text-xs text-slate-400">Choose your favorite products or view your past orders</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap max-w-full">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 text-xs flex-wrap max-w-full">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'shop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
              <ShoppingBag className="w-4 h-4" /> Shop Catalog
            </button>
            <button
              onClick={() => setActiveTab('my_orders')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'my_orders' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Package className="w-4 h-4" /> My Orders ({myOrders.length})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/30">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm">{cart.reduce((sum, i) => sum + i.quantity, 0)} items</span>
          </div>
        </div>
      </div>

      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProductCatalog
            products={products}
            loading={loading}
            addingId={addingId}
            onAddToCart={handleAddToCart}
          />
          <ShoppingCartComponent
            cart={cart}
            checkoutStatus={checkoutStatus}
            onFetchCart={fetchCart}
            onCheckout={handleCheckout}
          />
        </div>
      )}

      {activeTab === 'my_orders' && (
        <MyOrdersList
          orders={myOrders}
          loading={loadingMyOrders}
          onFetchOrders={fetchMyOrders}
          onOpenDetail={fetchMyOrderDetail}
        />
      )}

      <MyOrderDetailModal
        isOpen={isMyOrderModalOpen}
        loading={loadingMyOrderDetail}
        order={selectedMyOrder}
        onClose={() => {
          setIsMyOrderModalOpen(false);
          setSelectedMyOrder(null);
        }}
      />
    </div>
  );
}
