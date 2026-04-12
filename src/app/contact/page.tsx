'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Phone, MessageCircle, Check, Loader2 } from 'lucide-react';
import { SHOP_INFO } from '@/lib/data';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Contact</p>
          <h1 className="section-title text-4xl sm:text-5xl gradient-text">Get in Touch</h1>
          <p className="text-orange-100/50 mt-3">We'd love to hear from you! Order, ask a question, or just say hi.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: MapPin, title: 'Our Location', value: SHOP_INFO.address, color: '#c0392b' },
              { icon: Clock, title: 'Timings', value: `${SHOP_INFO.openTime} – ${SHOP_INFO.closeTime} (Daily)`, color: '#e67e22' },
              { icon: Phone, title: 'Phone', value: SHOP_INFO.phone, color: '#f39c12' },
            ].map(({ icon: Icon, title, value, color }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 items-start p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-orange-100">{title}</p>
                  <p className="text-orange-100/60 text-sm mt-1">{value}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick WhatsApp */}
            <a
              href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent("Hi! I'd like to enquire about your momos.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-2xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <MessageCircle className="w-6 h-6 text-white" fill="white" />
              <div>
                <p className="font-bold text-white">Chat on WhatsApp</p>
                <p className="text-white/80 text-sm">Fastest way to reach us!</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-orange-100 mb-2">Message Sent! 🎉</h3>
                <p className="text-orange-100/60 text-sm">We'll get back to you soon. Or just WhatsApp us for a quicker response!</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-6 rounded-3xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h2 className="font-bold text-orange-100 mb-2">Send a Message</h2>
                {[
                  { id: 'contact-name', label: 'Name', field: 'name', type: 'text', placeholder: 'Your name' },
                  { id: 'contact-phone', label: 'Phone', field: 'phone', type: 'tel', placeholder: 'Your phone number' },
                ].map(({ id, label, field, type, placeholder }) => (
                  <div key={field}>
                    <label htmlFor={id} className="text-xs text-orange-100/50 font-medium mb-1 block">{label}</label>
                    <input
                      id={id}
                      type={type}
                      value={form[field as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={placeholder}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm text-orange-100 placeholder-orange-100/30 outline-none focus:ring-2 focus:ring-orange-500/50"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="contact-message" className="text-xs text-orange-100/50 font-medium mb-1 block">Message</label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={4}
                    required
                    className="w-full p-3 rounded-xl text-sm text-orange-100 placeholder-orange-100/30 outline-none resize-none focus:ring-2 focus:ring-orange-500/50"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <button
                  type="submit"
                  id="contact-submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
