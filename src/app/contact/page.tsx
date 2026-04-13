'use client';

import { useState } from 'react';
import { Loader2, MapPin, MessageCircle, Phone } from 'lucide-react';
import { fallbackSettings } from '@/lib/customer-data';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', category: 'order-delay', message: '' });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [ticketId, setTicketId] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { message?: string; whatsappUrl?: string };
      setStatusMessage(payload.message || 'Message sent.');
      setWhatsappUrl(payload.whatsappUrl || '');
      setTicketId(`MM-${Date.now().toString(36).toUpperCase()}`);
      if (response.ok) {
        setForm({ name: '', phone: '', category: 'order-delay', message: '' });
      }
    } catch {
      setStatusMessage('We could not send the form right now. Please use WhatsApp instead.');
      setWhatsappUrl(`https://wa.me/${fallbackSettings.whatsapp}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page">
      <div className="app-container grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-5">
          <div>
            <p className="section-kicker">Contact</p>
            <h1 className="mt-2 text-5xl font-semibold text-white">Reach the kitchen directly.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/56">
              Ask about delivery range, special requests, WhatsApp ordering, or combo recommendations.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: MapPin, title: 'Location', detail: fallbackSettings.address },
              { icon: Phone, title: 'Phone', detail: fallbackSettings.phone },
              { icon: MessageCircle, title: 'WhatsApp', detail: fallbackSettings.whatsapp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="surface-card rounded-[30px] p-5">
                  <Icon className="h-5 w-5 text-[#ff8a5b]" />
                  <p className="mt-4 text-lg font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/56">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-card rounded-[34px] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="contact-name" className="form-label">Name</label>
              <input
                id="contact-name"
                value={form.name}
                onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                className="form-input"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="form-label">Phone</label>
              <input
                id="contact-phone"
                value={form.phone}
                onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))}
                className="form-input"
                placeholder="Your phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="contact-category" className="form-label">Issue category</label>
              <select
                id="contact-category"
                value={form.category}
                onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))}
                className="form-input"
              >
                <option value="order-delay">Order delay</option>
                <option value="missing-item">Missing/wrong item</option>
                <option value="payment-issue">Payment issue</option>
                <option value="account-login">Account/login</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="form-label">Message</label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))}
                className="form-textarea"
                placeholder="How can we help?"
                required
              />
            </div>

            {statusMessage && (
              <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-4 text-sm text-white/62">
                <p>{statusMessage}</p>
                {ticketId && <p className="mt-2 text-xs text-white/45">Ticket reference: {ticketId}</p>}
                <p className="mt-1 text-xs text-white/45">Typical response SLA: under 10 minutes (live hours).</p>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[#ffb48a]">
                    Continue on WhatsApp
                  </a>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                'Send message'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

