'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Clock, ChevronRight, Edit2, Star, Phone, LogOut, Package, Heart, Settings } from 'lucide-react';
import { SHOP_INFO } from '@/lib/data';

export default function ProfilePage() {
  const { userName, setUserName, address, setAddress, recentOrders, wishlist } = useCart();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [editingAddr, setEditingAddr] = useState(false);
  const [addrInput, setAddrInput] = useState({ area: address?.area || '', address: address?.address || '', label: address?.label || 'Home' });

  return (
    <div className="min-h-screen pt-16 pb-24" style={{ background: '#07060f' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(7,6,15,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </Link>
        <h1 className="font-black text-lg" style={{ color: '#FAFAFA' }}>My Profile</h1>
        <Settings className="w-5 h-5 ml-auto" style={{ color: 'rgba(250,250,250,0.4)' }} />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a0a1a, #0f0e1a)', border: '1px solid rgba(255,107,107,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>
              {userName ? userName[0].toUpperCase() : '👤'}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex gap-2">
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                    placeholder="Your name" className="swiggy-input text-sm flex-1" autoFocus />
                  <button onClick={() => { setUserName(nameInput); setEditing(false); }}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-black text-lg" style={{ color: '#FAFAFA' }}>{userName || 'Guest User'}</p>
                  <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-white/10">
                    <Edit2 className="w-3.5 h-3.5" style={{ color: 'rgba(250,250,250,0.4)' }} />
                  </button>
                </div>
              )}
              <p className="text-sm mt-0.5" style={{ color: 'rgba(250,250,250,0.4)' }}>{SHOP_INFO.phone}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { val: recentOrders.length, label: 'Orders', icon: Package, color: '#FF6B6B' },
              { val: wishlist.length, label: 'Saved', icon: Heart, color: '#FF8E53' },
              { val: '4.9', label: 'Rating', icon: Star, color: '#FFC857' },
            ].map(({ val, label, icon: Icon, color }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                <p className="font-black text-lg" style={{ color }}>{val}</p>
                <p className="text-xs" style={{ color: 'rgba(250,250,250,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Saved Address */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm flex items-center gap-2" style={{ color: '#FAFAFA' }}>
              <MapPin className="w-4 h-4 text-orange-400" /> Saved Address
            </p>
            <button onClick={() => setEditingAddr(!editingAddr)} className="text-xs font-semibold" style={{ color: '#FF6B6B' }}>
              {editingAddr ? 'Cancel' : address ? 'Edit' : '+ Add'}
            </button>
          </div>
          {editingAddr ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map(l => (
                  <button key={l} onClick={() => setAddrInput(a => ({ ...a, label: l }))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: addrInput.label === l ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.05)', color: addrInput.label === l ? '#FF6B6B' : 'rgba(250,250,250,0.5)', border: `1px solid ${addrInput.label === l ? '#FF6B6B' : 'rgba(255,255,255,0.08)'}` }}>
                    {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍'} {l}
                  </button>
                ))}
              </div>
              <input value={addrInput.area} onChange={e => setAddrInput(a => ({ ...a, area: e.target.value }))}
                placeholder="Area / Sector" className="swiggy-input text-sm" />
              <input value={addrInput.address} onChange={e => setAddrInput(a => ({ ...a, address: e.target.value }))}
                placeholder="Full address, landmark..." className="swiggy-input text-sm" />
              <button onClick={() => { setAddress(addrInput); setEditingAddr(false); }}
                className="w-full py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>
                Save Address
              </button>
            </div>
          ) : address ? (
            <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div>
                <p className="text-xs font-bold px-2 py-0.5 rounded-full mb-1 w-fit" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B' }}>
                  {address.label === 'Home' ? '🏠' : address.label === 'Work' ? '💼' : '📍'} {address.label}
                </p>
                <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{address.area}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(250,250,250,0.4)' }}>{address.address}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(250,250,250,0.3)' }}>No address saved yet</p>
          )}
        </motion.div>

        {/* Order History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#FAFAFA' }}>
            <Clock className="w-4 h-4 text-orange-400" /> Order History
          </p>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🛵</p>
              <p className="text-sm" style={{ color: 'rgba(250,250,250,0.3)' }}>No orders yet. Place your first order!</p>
              <Link href="/menu" className="inline-block mt-3 text-xs font-semibold btn-primary py-2 px-4">Order Now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'rgba(250,250,250,0.4)' }}>Order #{order.id}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(250,250,250,0.3)' }}>{order.date}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: order.status === 'delivered' ? 'rgba(107,203,119,0.12)' : order.status === 'cancelled' ? 'rgba(255,107,107,0.12)' : 'rgba(255,200,87,0.12)',
                        color: order.status === 'delivered' ? '#6BCB77' : order.status === 'cancelled' ? '#FF6B6B' : '#FFC857',
                      }}>
                      {order.status === 'delivered' ? '✅ Delivered' : order.status === 'cancelled' ? '❌ Cancelled' : '🔄 Processing'}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'rgba(250,250,250,0.5)' }}>
                    {order.items.map(it => `${it.name} ×${it.quantity}`).join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm" style={{ color: '#FF6B6B' }}>₹{order.total}</span>
                    <Link href="/menu" className="text-xs font-semibold" style={{ color: '#4ECDC4' }}>Reorder →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { icon: '📱', label: 'Contact on WhatsApp', href: `https://wa.me/${SHOP_INFO.whatsapp}`, ext: true },
            { icon: '🌐', label: 'Visit Website', href: '/', ext: false },
            { icon: '📋', label: 'Menu', href: '/menu', ext: false },
            { icon: '❤️', label: 'Saved Items', href: '/wishlist', ext: false },
          ].map(({ icon, label, href, ext }) => (
            <a key={label} href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <span className="text-xl w-8 text-center">{icon}</span>
              <span className="text-sm font-medium flex-1" style={{ color: 'rgba(250,250,250,0.7)' }}>{label}</span>
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.25)' }} />
            </a>
          ))}
        </motion.div>

        <p className="text-center text-xs pb-4" style={{ color: 'rgba(250,250,250,0.2)' }}>
          Meghna's Kitchen v1.0 · Made with ❤️
        </p>
      </div>
    </div>
  );
}
