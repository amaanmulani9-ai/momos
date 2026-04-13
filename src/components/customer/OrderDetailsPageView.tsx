'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock3, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { fallbackSettings, type OrderRecord } from '@/lib/customer-data';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';

const STATUS_LABELS: Record<OrderRecord['orderStatus'], string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailsPageView({ orderId }: { orderId: string }) {
  const { getRecentOrderById } = useCart();
  const [order, setOrder] = useState<OrderRecord | null>(getRecentOrderById(orderId) ?? null);
  const [loading, setLoading] = useState(order ? false : true);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      const localOrder = getRecentOrderById(orderId);
      if (localOrder) {
        setOrder(localOrder);
        setLoading(false);
      }

      try {
        const response = await fetch(`/api/order/${orderId}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const payload = (await response.json()) as { order?: OrderRecord };
        if (!cancelled && payload.order) {
          setOrder(payload.order);
        }
      } catch {
        // Ignore fetch failures and rely on local fallback only.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();
    const interval = window.setInterval(loadOrder, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [getRecentOrderById, orderId]);

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-container">
          <div className="surface-card mx-auto max-w-2xl rounded-[36px] p-10 text-center">
            <p className="text-sm text-white/55">Loading your order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="app-page">
        <div className="app-container">
          <div className="surface-card mx-auto max-w-2xl rounded-[36px] p-10 text-center">
            <h1 className="text-3xl font-semibold text-white">Order not found</h1>
            <p className="mt-3 text-sm leading-7 text-white/55">
              We could not load that order right now. If you just placed it, check WhatsApp or return to your recent orders.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/profile" className="btn-secondary">Recent orders</Link>
              <Link href="/menu" className="btn-primary">Back to menu</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeline = [
    { key: 'confirmed' as const, label: 'Order placed' },
    { key: 'preparing' as const, label: 'Kitchen preparing' },
    { key: 'out_for_delivery' as const, label: 'Out for delivery' },
    { key: 'delivered' as const, label: 'Delivered' },
  ];

  const statusRank: Record<OrderRecord['orderStatus'], number> = {
    confirmed: 1,
    preparing: 2,
    out_for_delivery: 3,
    delivered: 4,
    cancelled: 0,
  };
  const placedAt = new Date(order.createdAt);
  const checkpoints = {
    confirmed: placedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    preparing: new Date(placedAt.getTime() + 8 * 60_000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    out_for_delivery: new Date(placedAt.getTime() + 20 * 60_000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    delivered: new Date(placedAt.getTime() + 35 * 60_000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
  const delayed = Date.now() - placedAt.getTime() > 45 * 60_000 && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';

  return (
    <div className="app-page">
      <div className="app-container grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="space-y-5">
          <div>
            <p className="section-kicker">Order tracking</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Order #{order.id}</h1>
            <p className="mt-3 text-sm text-white/56">
              {STATUS_LABELS[order.orderStatus]} • placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
            {delayed && (
              <p className="mt-2 text-sm text-[#ffcf9f]">
                Slight delay detected. Support team is prioritizing your order.
              </p>
            )}
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {(['confirmed', 'preparing', 'out_for_delivery'] as Array<OrderRecord['orderStatus']>).map((status, index) => {
                const activeIndex = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].indexOf(order.orderStatus);
                const currentIndex = ['confirmed', 'preparing', 'out_for_delivery'].indexOf(status);
                const done = activeIndex >= currentIndex && order.orderStatus !== 'cancelled';
                return (
                  <div
                    key={status}
                    className="rounded-[24px] border p-4"
                    style={{
                      borderColor: done ? 'rgba(255,138,91,0.34)' : 'rgba(255,255,255,0.08)',
                      background: done ? 'rgba(255,138,91,0.1)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">Step {index + 1}</p>
                    <p className="mt-3 font-medium text-white">{STATUS_LABELS[status]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-xl font-semibold text-white">Live timeline</h2>
            <div className="mt-5 space-y-3">
              {timeline.map((step, idx) => {
                const done = statusRank[order.orderStatus] >= idx + 1 && order.orderStatus !== 'cancelled';
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <span
                      className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs"
                      style={{
                        borderColor: done ? 'rgba(255,138,91,0.45)' : 'rgba(255,255,255,0.14)',
                        background: done ? 'rgba(255,138,91,0.15)' : 'transparent',
                        color: done ? '#fff' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm text-white/72">{step.label}</p>
                      <p className="text-xs text-white/45">
                        {checkpoints[step.key]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-xl font-semibold text-white">Items</h2>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.name}`} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-white/4 px-4 py-4 text-sm text-white/65">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[calc(var(--app-header-height)+2rem)] xl:self-start">
          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-xl font-semibold text-white">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-white/58">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
              </div>
              {order.couponSavings ? (
                <div className="flex items-center justify-between text-[#9de7c2]">
                  <span>Coupon savings</span>
                  <span>-{formatPrice(order.couponSavings)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-xl font-semibold text-white">Delivery details</h2>
            <div className="mt-5 space-y-4 text-sm text-white/58">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-[#ff8a5b]" />
                <div>
                  <p className="font-medium text-white">{order.customerName}</p>
                  <p className="mt-1">{order.addressLabel ? `${order.addressLabel} • ` : ''}{order.area}</p>
                  <p className="mt-1">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-[#ff8a5b]" />
                <div>
                  <p className="font-medium text-white">{order.phone}</p>
                  <p className="mt-1">{order.paymentMethod} • {order.paymentStatus}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 h-4 w-4 text-[#ff8a5b]" />
                <div>
                  <p className="font-medium text-white">{STATUS_LABELS[order.orderStatus]}</p>
                  <p className="mt-1">{order.persisted ? 'Stored in the live order system.' : 'Stored locally on this device.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/35">Need help?</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={order.whatsappUrl || `https://wa.me/${fallbackSettings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 justify-center"
              >
                <MessageCircle className="h-4 w-4" />
                Open WhatsApp
              </a>
              <Link href="/menu" className="btn-secondary flex-1 justify-center">
                Reorder
              </Link>
              <Link href="/contact" className="btn-secondary flex-1 justify-center">
                Contact support
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

