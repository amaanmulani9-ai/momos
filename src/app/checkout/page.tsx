'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { fallbackSettings, type OrderRecord } from '@/lib/customer-data';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import AddressSearch from '@/components/customer/AddressSearch';

type PaymentMethod = 'COD' | 'UPI' | 'WhatsApp' | 'RAZORPAY';
type DeliverySlot = 'ASAP' | '30_MIN' | '60_MIN';

interface CheckoutForm {
  name: string;
  phone: string;
  area: string;
  address: string;
  label: string;
  notes: string;
  deliverySlot: DeliverySlot;
  paymentMethod: PaymentMethod;
  placeId?: string;
  lat?: number;
  lng?: number;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    coupon,
    couponSavings,
    address,
    userName,
    userPhone,
    setAddress,
    setUserName,
    setUserPhone,
    addOrder,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [form, setForm] = useState<CheckoutForm>({
    name: userName,
    phone: userPhone,
    area: address?.area ?? '',
    address: address?.address ?? '',
    label: address?.label ?? 'Home',
    notes: '',
    paymentMethod: 'COD',
    deliverySlot: 'ASAP' as DeliverySlot,
    placeId: address?.placeId,
    lat: address?.lat,
    lng: address?.lng,
  });

  const phoneValid = /^\+?\d{10,15}$/.test(form.phone.replace(/\s+/g, ''));
  const stepOneReady = Boolean(form.name.trim().length >= 2 && phoneValid && form.area && form.address);
  const restaurantId = items[0]?.product.restaurantId;
  const restaurantName = items[0]?.product.restaurantName;
  const payableTotal = total + tip;

  function buildOrderPayload(paymentMethod: PaymentMethod) {
    return {
      customer_name: form.name,
      phone: form.phone,
      area: form.area,
      address: form.address,
      address_label: form.label,
      notes: form.notes,
      payment_method: paymentMethod,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: payableTotal,
      coupon_code: coupon || undefined,
      coupon_savings: couponSavings || 0,
      restaurant_id: restaurantId,
      place_id: form.placeId,
      latitude: form.lat,
      longitude: form.lng,
      items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        item_price: item.product.price,
        image_url: item.product.imageUrl,
      })),
    };
  }

  function buildLocalOrderRecord(
    payload: {
      orderId: string;
      status: OrderRecord['orderStatus'];
      persisted: boolean;
      whatsappUrl?: string;
    },
    paymentMethod: PaymentMethod,
    paymentStatus: OrderRecord['paymentStatus'],
  ): OrderRecord {
    return {
      id: payload.orderId,
      customerName: form.name,
      phone: form.phone,
      addressLabel: form.label,
      area: form.area,
      address: form.address,
      notes: form.notes,
      paymentMethod,
      paymentStatus,
      orderStatus: payload.status || 'confirmed',
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        imageUrl: item.product.imageUrl,
      })),
      subtotal,
      deliveryFee,
      totalAmount: payableTotal,
      couponCode: coupon || undefined,
      couponSavings: couponSavings || 0,
      createdAt: new Date().toISOString(),
      persisted: Boolean(payload.persisted),
      whatsappUrl: payload.whatsappUrl,
      restaurantId,
      restaurantName,
    };
  }

  async function placeOrder() {
    if (!stepOneReady || items.length === 0) {
      return;
    }

    setLoading(true);
    setError('');
    if (!phoneValid) {
      setError('Enter a valid phone number (10-15 digits).');
      setLoading(false);
      return;
    }
    let skipFinallyLoading = false;

    try {
      if (form.paymentMethod === 'RAZORPAY') {
        const orderRes = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildOrderPayload('RAZORPAY')),
        });
        const orderJson = (await orderRes.json()) as {
          success?: boolean;
          orderId?: string;
          status?: OrderRecord['orderStatus'];
          persisted?: boolean;
          whatsappUrl?: string;
          message?: string;
        };
        if (!orderRes.ok || !orderJson.orderId) {
          throw new Error(orderJson.message || 'Unable to create order.');
        }
        if (!orderJson.persisted) {
          throw new Error('Razorpay needs Supabase so the order can be saved. Check your database connection.');
        }

        const rzRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderJson.orderId }),
        });
        const rzJson = (await rzRes.json()) as {
          razorpayOrderId?: string;
          keyId?: string;
          amount?: number;
          currency?: string;
          error?: string;
        };
        if (!rzRes.ok || !rzJson.razorpayOrderId || !rzJson.keyId || rzJson.amount == null) {
          throw new Error(rzJson.error || 'Could not start Razorpay checkout. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
        }

        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Failed to load Razorpay checkout script.');
        }

        const Rzp = (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
        const orderId = orderJson.orderId;
        const snapshot = buildLocalOrderRecord(
          {
            orderId,
            status: orderJson.status ?? 'confirmed',
            persisted: Boolean(orderJson.persisted),
            whatsappUrl: orderJson.whatsappUrl,
          },
          'RAZORPAY',
          'pending',
        );

        const options: Record<string, unknown> = {
          key: rzJson.keyId,
          amount: rzJson.amount,
          currency: rzJson.currency ?? 'INR',
          order_id: rzJson.razorpayOrderId,
          name: restaurantName ?? fallbackSettings.name,
          description: 'Food order',
          prefill: { name: form.name, contact: form.phone },
          theme: { color: '#ff8a5b' },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                app_order_id: orderId,
              }),
            });
            const verifyJson = (await verifyRes.json()) as { success?: boolean; error?: string };
            if (!verifyRes.ok || !verifyJson.success) {
              setError(verifyJson.error || 'Payment verification failed.');
              setLoading(false);
              return;
            }
            setUserName(form.name);
            setUserPhone(form.phone);
            setAddress({
              label: form.label,
              area: form.area,
              address: form.address,
              placeId: form.placeId,
              lat: form.lat,
              lng: form.lng,
            });
            addOrder({ ...snapshot, paymentStatus: 'paid' });
            clearCart();
            router.push(`/order/success?orderId=${orderId}`);
            setLoading(false);
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const instance = new Rzp(options);
        skipFinallyLoading = true;
        instance.open();
        return;
      }

      const enrichedNotes = [
        form.deliverySlot === 'ASAP' ? 'Delivery: ASAP' : `Delivery slot: ${form.deliverySlot.replace('_', ' ')}`,
        tip > 0 ? `Tip: Rs.${tip}` : '',
        form.notes,
      ]
        .filter(Boolean)
        .join(' | ');

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buildOrderPayload(form.paymentMethod),
          notes: enrichedNotes,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        orderId?: string;
        status?: OrderRecord['orderStatus'];
        persisted?: boolean;
        whatsappUrl?: string;
        message?: string;
      };

      if (!response.ok || !payload.orderId) {
        throw new Error(payload.message || 'Unable to create order.');
      }

      const orderRecord = buildLocalOrderRecord(
        {
          orderId: payload.orderId,
          status: payload.status ?? 'confirmed',
          persisted: Boolean(payload.persisted),
          whatsappUrl: payload.whatsappUrl,
        },
        form.paymentMethod,
        'pending',
      );

      setUserName(form.name);
      setUserPhone(form.phone);
      setAddress({
        label: form.label,
        area: form.area,
        address: form.address,
        placeId: form.placeId,
        lat: form.lat,
        lng: form.lng,
      });
      addOrder(orderRecord);
      clearCart();
      router.push(`/order/success?orderId=${payload.orderId}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to place order.');
    } finally {
      if (!skipFinallyLoading) {
        setLoading(false);
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="app-page">
        <div className="app-container">
          <div className="surface-card mx-auto flex max-w-2xl flex-col items-center rounded-[36px] px-6 py-16 text-center">
            <ShoppingBag className="h-9 w-9 text-white/55" />
            <h1 className="mt-6 text-3xl font-semibold text-white">Your cart is empty</h1>
            <p className="mt-3 text-sm leading-7 text-white/55">
              Add some dishes before moving into the checkout flow.
            </p>
            <Link href="/" className="btn-primary mt-6">
              Browse restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <section className="space-y-5">
          <div>
            <p className="section-kicker">Checkout</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">A two-step finish built for mobile ordering.</h1>
            {restaurantName && (
              <p className="mt-2 text-sm text-white/50">
                Ordering from <span className="font-medium text-white/75">{restaurantName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {[1, 2].map((stepValue) => (
              <button
                key={stepValue}
                type="button"
                onClick={() => setStep(stepValue as 1 | 2)}
                className="rounded-full border px-4 py-2 text-sm"
                style={{
                  borderColor: step === stepValue ? 'rgba(255,138,91,0.38)' : 'rgba(255,255,255,0.1)',
                  background: step === stepValue ? 'rgba(255,138,91,0.12)' : 'rgba(255,255,255,0.03)',
                  color: step === stepValue ? '#ffffff' : 'rgba(255,255,255,0.6)',
                }}
              >
                Step {stepValue}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <div className="surface-card rounded-[32px] p-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="checkout-name" className="form-label">Customer name</label>
                  <input
                    id="checkout-name"
                    value={form.name}
                    onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                    className="form-input"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="form-label">Phone number</label>
                  <input
                    id="checkout-phone"
                    value={form.phone}
                    onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))}
                    className="form-input"
                    placeholder="+91XXXXXXXXXX"
                  />
                  <p className="mt-2 text-xs text-white/45">
                    Add country code for best OTP/payment compatibility.
                  </p>
                </div>

                <AddressSearch
                  areaValue={form.area}
                  addressValue={form.address}
                  onResolved={(place) => {
                    setForm((f) => ({
                      ...f,
                      area: place.area,
                      address: place.address,
                      placeId: place.placeId,
                      lat: place.lat,
                      lng: place.lon,
                    }));
                  }}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="checkout-label" className="form-label">Address label</label>
                    <select
                      id="checkout-label"
                      value={form.label}
                      onChange={(event) => setForm((value) => ({ ...value, label: event.target.value }))}
                      className="form-input"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="checkout-area" className="form-label">Area or sector</label>
                    <input
                      id="checkout-area"
                      value={form.area}
                      onChange={(event) => setForm((value) => ({ ...value, area: event.target.value }))}
                      className="form-input"
                      placeholder="Sector 18, Noida"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-address" className="form-label">Full address</label>
                  <textarea
                    id="checkout-address"
                    value={form.address}
                    onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))}
                    className="form-textarea"
                    placeholder="House, tower, landmark, delivery notes..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!stepOneReady}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="surface-card rounded-[32px] p-6">
                <h2 className="text-xl font-semibold text-white">Delivery details</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="surface-soft rounded-[24px] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Deliver to</p>
                    <p className="mt-3 flex items-center gap-2 text-white">
                      <MapPin className="h-4 w-4 text-[#ff8a5b]" />
                      {form.label} - {form.area}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/55">{form.address}</p>
                  </div>
                  <div className="surface-soft rounded-[24px] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Contact</p>
                    <p className="mt-3 flex items-center gap-2 text-white">
                      <Phone className="h-4 w-4 text-[#ff8a5b]" />
                      {form.name}
                    </p>
                    <p className="mt-2 text-sm text-white/55">{form.phone}</p>
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[32px] p-6">
                <h2 className="text-xl font-semibold text-white">Payment method</h2>
                <div className="mt-5 grid gap-3">
                  {(
                    [
                      { value: 'COD' as const, title: 'Cash on delivery', detail: 'Pay when your order arrives.' },
                      { value: 'UPI' as const, title: 'UPI transfer', detail: `Use ${fallbackSettings.upiId} after confirmation.` },
                      { value: 'WhatsApp' as const, title: 'WhatsApp confirm', detail: 'Send the order through WhatsApp for manual confirmation.' },
                      {
                        value: 'RAZORPAY' as const,
                        title: 'Card / UPI (Razorpay)',
                        detail: 'Pay online with Razorpay Checkout (requires server keys + Supabase order save).',
                      },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((value) => ({ ...value, paymentMethod: option.value }))}
                      className="rounded-[24px] border p-4 text-left"
                      style={{
                        borderColor: form.paymentMethod === option.value ? 'rgba(255,138,91,0.38)' : 'rgba(255,255,255,0.08)',
                        background: form.paymentMethod === option.value ? 'rgba(255,138,91,0.1)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <p className="font-medium text-white">{option.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/55">{option.detail}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="form-label">Delivery slot</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {([
                      { value: 'ASAP', label: 'ASAP' },
                      { value: '30_MIN', label: '30 min' },
                      { value: '60_MIN', label: '60 min' },
                    ] as Array<{ value: DeliverySlot; label: string }>).map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setForm((value) => ({ ...value, deliverySlot: slot.value }))}
                        className="rounded-[16px] border px-3 py-2 text-sm"
                        style={{
                          borderColor: form.deliverySlot === slot.value ? 'rgba(255,138,91,0.38)' : 'rgba(255,255,255,0.08)',
                          background: form.deliverySlot === slot.value ? 'rgba(255,138,91,0.1)' : 'rgba(255,255,255,0.03)',
                          color: form.deliverySlot === slot.value ? '#fff' : 'rgba(255,255,255,0.65)',
                        }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="form-label">Rider tip</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    {[0, 10, 20, 30].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setTip(amount)}
                        className="rounded-[16px] border px-3 py-2 text-sm"
                        style={{
                          borderColor: tip === amount ? 'rgba(147,221,184,0.45)' : 'rgba(255,255,255,0.08)',
                          background: tip === amount ? 'rgba(147,221,184,0.12)' : 'rgba(255,255,255,0.03)',
                          color: tip === amount ? '#d8ffe9' : 'rgba(255,255,255,0.65)',
                        }}
                      >
                        {amount === 0 ? 'No tip' : `Rs.${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="checkout-notes" className="form-label">Kitchen notes</label>
                  <textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))}
                    className="form-textarea"
                    placeholder="Extra spicy, no onion, call on arrival..."
                  />
                </div>

                {error && <p className="mt-4 text-sm text-[#ffb8bf]">{error}</p>}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back
                  </button>
                  <button type="button" onClick={() => void placeOrder()} disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {form.paymentMethod === 'RAZORPAY' ? 'Starting checkout' : 'Placing order'}
                      </>
                    ) : form.paymentMethod === 'RAZORPAY' ? (
                      'Pay with Razorpay'
                    ) : (
                      'Place order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[calc(var(--app-header-height)+2rem)] xl:self-start">
          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-xl font-semibold text-white">Order summary</h2>
            {restaurantName && <p className="mt-2 text-xs text-white/45">{restaurantName}</p>}
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-sm text-white/62">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-white/10 pt-5 text-sm text-white/58">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              {tip > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span>Tip</span>
                  <span>{formatPrice(tip)}</span>
                </div>
              )}
              {couponSavings > 0 && (
                <div className="mt-3 flex items-center justify-between text-[#9de7c2]">
                  <span>Coupon savings</span>
                  <span>-{formatPrice(couponSavings)}</span>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(payableTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
