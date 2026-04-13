'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { MapPin, Phone, UserRound } from 'lucide-react';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const {
    userName,
    userPhone,
    address,
    recentOrders,
    wishlist,
    setUserName,
    setUserPhone,
    setAddress,
  } = useCart();
  const [draftName, setDraftName] = useState(userName);
  const [draftPhone, setDraftPhone] = useState(userPhone);
  const [draftArea, setDraftArea] = useState(address?.area ?? '');
  const [draftAddress, setDraftAddress] = useState(address?.address ?? '');
  const [draftLabel, setDraftLabel] = useState(address?.label ?? 'Home');
  const [status, setStatus] = useState('');
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const completeness = Math.round(
    ((userName ? 1 : 0) + (userPhone ? 1 : 0) + (address ? 1 : 0)) / 3 * 100,
  );

  return (
    <div className="app-page">
      <div className="app-container grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5">
          <div>
            <p className="section-kicker">Profile</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Customer details and recent orders.</h1>
            <p className="mt-2 text-sm text-white/55">Profile completeness: {completeness}%</p>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#ff8a5b,#ff5d6c)] text-xl font-semibold text-white">
                {(userName || 'G').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{userName || 'Guest customer'}</p>
                <p className="mt-1 text-sm text-white/52">{userPhone || 'No phone saved yet'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label htmlFor="profile-name" className="form-label">Name</label>
                <input
                  id="profile-name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className="form-label">Phone</label>
                <input
                  id="profile-phone"
                  value={draftPhone}
                  onChange={(event) => setDraftPhone(event.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  setUserName(draftName);
                  setUserPhone(draftPhone);
                  setStatus('Saved locally.');
                  const normalized = draftPhone.startsWith('+') ? draftPhone : `+${draftPhone.replace(/^\+?/, '')}`;
                  if (supabase && normalized.length >= 10) {
                    await supabase.auth.updateUser({
                      phone: normalized,
                      data: { full_name: draftName || undefined },
                    });
                    setStatus('Saved locally. Supabase profile sync requested.');
                  }
                }}
                className="btn-primary w-fit"
              >
                Save profile
              </button>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-2xl font-semibold text-white">Saved address</h2>
            <div className="mt-5 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-label" className="form-label">Label</label>
                  <select
                    id="profile-label"
                    value={draftLabel}
                    onChange={(event) => setDraftLabel(event.target.value)}
                    className="form-input"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-area" className="form-label">Area</label>
                  <input
                    id="profile-area"
                    value={draftArea}
                    onChange={(event) => setDraftArea(event.target.value)}
                    className="form-input"
                    placeholder="Sector 18"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile-address" className="form-label">Address</label>
                <textarea
                  id="profile-address"
                  value={draftAddress}
                  onChange={(event) => setDraftAddress(event.target.value)}
                  className="form-textarea"
                  placeholder="House, tower, landmark..."
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  setAddress({ label: draftLabel, area: draftArea, address: draftAddress });
                  setStatus('Address saved locally.');

                  if (!supabase) {
                    return;
                  }

                  const {
                    data: { user },
                  } = await supabase.auth.getUser();

                  if (!user) {
                    return;
                  }

                  await supabase.from('user_addresses').insert({
                    user_id: user.id,
                    label: draftLabel,
                    area: draftArea,
                    formatted_address: draftAddress,
                    place_id: address?.placeId ?? null,
                    latitude: address?.lat ?? null,
                    longitude: address?.lng ?? null,
                  });

                  setStatus('Address saved to Supabase.');
                }}
                className="btn-primary w-fit"
              >
                Save address
              </button>
              {status && <p className="text-sm text-white/55">{status}</p>}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: UserRound, label: 'Saved items', value: wishlist.length },
              { icon: ShoppingBagIcon, label: 'Recent orders', value: recentOrders.length },
              { icon: MapPin, label: 'Addresses', value: address ? 1 : 0 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="surface-card rounded-[28px] p-5">
                  <Icon className="h-5 w-5 text-[#ff8a5b]" />
                  <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-white/48">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <h2 className="text-2xl font-semibold text-white">Recent orders</h2>
            <div className="mt-5 space-y-4">
              {recentOrders.length === 0 ? (
                <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-6 text-sm text-white/55">
                  No orders yet. Place one from the updated menu to see the tracking flow.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link key={order.id} href={`/order/${order.id}`} className="block rounded-[24px] border border-white/8 bg-white/4 p-4 transition-colors hover:border-white/16">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">Order #{order.id}</p>
                        <p className="mt-1 text-sm text-white/48">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                      <span className="rounded-full border border-white/8 px-3 py-1 text-xs text-white/62">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/55">
                      {order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}
                    </p>
                    <p className="mt-3 text-sm font-medium text-white">{formatPrice(order.totalAmount)}</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/order/${order.id}`} className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70">
                        Track
                      </Link>
                      <Link href="/menu" className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70">
                        Reorder similar
                      </Link>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ShoppingBagIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 9V7a3 3 0 1 1 6 0v2" />
    </svg>
  );
}
