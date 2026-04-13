import Link from 'next/link';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { fallbackSettings } from '@/lib/customer-data';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderId =
    typeof resolvedSearchParams.orderId === 'string'
      ? resolvedSearchParams.orderId
      : resolvedSearchParams.orderId?.[0];

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="surface-card mx-auto max-w-3xl rounded-[38px] px-6 py-16 text-center sm:px-10">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(147,221,184,0.12)]">
            <CheckCircle2 className="h-10 w-10 text-[#9de7c2]" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white">Order placed successfully</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/56">
            The checkout handoff is complete. You can track your order details from the dedicated order page or keep a support conversation open on WhatsApp.
          </p>

          {orderId && (
            <p className="mt-5 text-sm text-white/48">
              Reference: <span className="font-medium text-white">{orderId}</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {orderId ? (
              <Link href={`/order/${orderId}`} className="btn-primary">
                View order details
              </Link>
            ) : (
              <Link href="/profile" className="btn-primary">
                Go to recent orders
              </Link>
            )}
            <a
              href={`https://wa.me/${fallbackSettings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
