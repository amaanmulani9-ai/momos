'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store';
import { generateWhatsAppMessage, SHOP_INFO } from '@/lib/data';
import { ShoppingBag, MessageCircle, MapPin, User, Check, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type PaymentMethod = 'COD' | 'UPI' | 'WhatsApp';
interface FormData { name: string; phone: string; address: string; area: string; notes: string; payment: PaymentMethod; }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total } = useCart();
  const [form, setForm] = useState<FormData>({ name: '', phone: '', address: '', area: '', notes: '', payment: 'COD' });
  const [loading, setLoading] = useState(false);

  const isValid = form.name && form.phone.length >= 10 && form.address && form.area;

  const handlePlaceOrder = async () => {
    if (!isValid) return;
    setLoading(true);

    // Save order data for receipt page
    sessionStorage.setItem('lastOrder', JSON.stringify({
      items: items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      subtotal, deliveryFee, total,
      name: form.name, address: `${form.area}, ${form.address}`, payment: form.payment,
    }));

    let n8nUsed = false;
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name, phone: form.phone,
          address: `${form.address}, ${form.area}`, payment_method: form.payment,
          notes: form.notes, total_amount: total,
          items: items.map(i => ({ product_id: i.product.id, product_name: i.product.name, quantity: i.quantity, item_price: i.product.price })),
        }),
      });
      const data = await res.json();
      if (data?.n8nSuccess) n8nUsed = true;
    } catch { /* continue even if API fails */ }

    if (!n8nUsed) {
      const msg = generateWhatsAppMessage(
        items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
        total, { name: form.name, phone: form.phone, address: `${form.address}, ${form.area}`, payment: form.payment }
      );
      window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${msg}`, '_blank');
    }
    
    setLoading(false);
    router.push('/order/success');
  };

  if (items.length === 0) return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-orange-100 mb-3">Your cart is empty</h1>
        <p className="text-orange-100/50 mb-6">Add items from our menu first!</p>
        <Link href="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 pb-32" style={{ background: '#0d0500' }}>
      {/* Header */}
      <div className="sticky top-16 z-10 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(13,5,0,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/menu" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-orange-100" />
        </Link>
        <h1 className="font-bold text-orange-100 text-lg">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Delivery Address */}
        <Section title="🏠 Delivery Address" icon={<MapPin className="w-4 h-4 text-orange-400" />}>
          <InputField id="checkout-area" label="Area / Sector *" value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} placeholder="e.g. Sector 18, Noida" />
          <div>
            <label htmlFor="checkout-address" className="swiggy-label">Full Address *</label>
            <textarea id="checkout-address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="House/Flat No., Street, Landmark..." rows={3}
              className="swiggy-input resize-none" />
          </div>
        </Section>

        {/* Personal Details */}
        <Section title="👤 Your Details" icon={<User className="w-4 h-4 text-orange-400" />}>
          <InputField id="checkout-name" label="Full Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Enter your name" />
          <InputField id="checkout-phone" label="Phone Number *" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+91 XXXXX XXXXX" type="tel" />
          <InputField id="checkout-notes" label="Special Instructions" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Extra spicy, no onions..." />
        </Section>

        {/* Payment */}
        <Section title="💳 Payment Method" icon={<ShoppingBag className="w-4 h-4 text-orange-400" />}>
          <div className="space-y-2">
            {([
              { value: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', emoji: '💵' },
              { value: 'UPI', label: `UPI`, sub: SHOP_INFO.upiId, emoji: '📲' },
              { value: 'WhatsApp', label: 'Confirm on WhatsApp', sub: 'Chat to confirm & pay', emoji: '📱' },
            ] as const).map(({ value, label, sub, emoji }) => (
              <label key={value} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: form.payment === value ? 'rgba(255,124,0,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.payment === value ? '#ff7c00' : 'rgba(255,255,255,0.06)'}` }}>
                <input type="radio" name="payment" value={value} checked={form.payment === value} onChange={() => setForm(f => ({ ...f, payment: value }))} className="sr-only" />
                <span className="text-xl">{emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-100">{label}</p>
                  <p className="text-xs text-orange-100/40">{sub}</p>
                </div>
                {form.payment === value && <Check className="w-4 h-4 text-orange-400" />}
              </label>
            ))}
          </div>
        </Section>

        {/* Order Summary */}
        <Section title="🧾 Order Summary" icon={<ShoppingBag className="w-4 h-4 text-orange-400" />}>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-orange-100/70">{item.product.name} <span className="text-orange-100/40">×{item.quantity}</span></span>
                <span className="text-orange-100 font-medium">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1.5 mt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex justify-between text-sm text-orange-100/60"><span>Item Total</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-sm text-orange-100/60">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <span className="text-green-400 font-medium">FREE 🎉</span> : `₹${deliveryFee}`}</span>
            </div>
            {deliveryFee > 0 && <p className="text-xs text-orange-400/70">Add ₹{SHOP_INFO.freeDeliveryAbove - subtotal} more for free delivery!</p>}
          </div>
        </Section>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-30" style={{ background: 'rgba(13,5,0,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-orange-100/40">To Pay</p>
            <p className="text-2xl font-bold gradient-text">₹{total}</p>
          </div>
          <motion.button id="place-order-btn" onClick={handlePlaceOrder} disabled={!isValid || loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</> : <><MessageCircle className="w-4 h-4" /> Place Order via WhatsApp</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl space-y-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <h2 className="font-bold text-orange-100 text-sm flex items-center gap-2">{icon}{title}</h2>
      {children}
    </motion.div>
  );
}

function InputField({ id, label, value, onChange, placeholder, type = 'text' }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="swiggy-label">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="swiggy-input" />
    </div>
  );
}
