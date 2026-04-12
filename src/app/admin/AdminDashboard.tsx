'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Package, TrendingUp, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  order_status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  order_items?: Array<{ product_name: string; quantity: number; item_price: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f39c12',
  confirmed: '#3498db',
  preparing: '#e67e22',
  delivered: '#27ae60',
  cancelled: '#e74c3c',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/order');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order_status === 'pending').length,
    delivered: orders.filter((o) => o.order_status === 'delivered').length,
    revenue: orders.filter((o) => o.order_status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0),
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title text-3xl gradient-text">Admin Dashboard</h1>
            <p className="text-orange-100/50 text-sm mt-1">Meghna's Momos — Owner Panel</p>
          </div>
          <button
            id="admin-refresh-btn"
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-orange-100 transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: 'Total Orders', value: stats.total, color: '#c0392b' },
            { icon: Clock, label: 'Pending', value: stats.pending, color: '#f39c12' },
            { icon: CheckCircle, label: 'Delivered', value: stats.delivered, color: '#27ae60' },
            { icon: TrendingUp, label: 'Revenue', value: `₹${stats.revenue}`, color: '#e67e22' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs text-orange-100/50">{label}</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['orders', 'products'] as const).map((tab) => (
            <button
              key={tab}
              id={`admin-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-sm font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg, #c0392b, #e67e22)' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab ? '#fff' : 'rgba(253,246,236,0.6)',
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tab === 'orders' ? '📦 Orders' : '🍽️ Products'}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl shimmer-bg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 text-orange-100/40">
                <p className="text-5xl mb-4">📭</p>
                <p>No orders yet. Orders will appear here once placed.</p>
                <p className="text-xs mt-2">Connect Supabase to persist orders.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.order_status] || Clock;
                  const statusColor = STATUS_COLORS[order.order_status] || '#f39c12';
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex flex-wrap gap-4 items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-orange-100">{order.customer_name}</span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                              style={{ background: `${statusColor}22`, color: statusColor }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {order.order_status}
                            </span>
                          </div>
                          <p className="text-sm text-orange-100/50">{order.phone} · {order.address}</p>
                          {order.notes && <p className="text-xs text-orange-100/40 mt-1">Note: {order.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-300">₹{order.total_amount}</p>
                          <p className="text-xs text-orange-100/40">{order.payment_method}</p>
                          <p className="text-xs text-orange-100/30">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          {order.order_items.map((item, i) => (
                            <span key={i} className="text-xs text-orange-100/50 px-2 py-1 rounded-lg bg-white/5">
                              {item.product_name} ×{item.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Products Tab placeholder */}
        {activeTab === 'products' && (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="text-lg font-bold text-orange-100 mb-2">Product Management</h3>
            <p className="text-orange-100/50 text-sm max-w-sm mx-auto">
              Connect your Supabase database to manage products, update prices, and control stock directly from here.
            </p>
            <div className="mt-6 text-xs text-orange-100/30">
              Set <code className="text-orange-400">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-orange-400">SUPABASE_SERVICE_ROLE_KEY</code> in your .env.local
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
