import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="app-page">
      <div className="app-container">
        <div className="surface-card mx-auto mt-12 max-w-xl rounded-[36px] px-8 py-12 text-center">
          <p className="section-kicker">Offline mode</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">You are offline right now</h1>
          <p className="mt-4 text-sm leading-7 text-white/58">
            Cached pages are still available. Reconnect to place new orders, sync profile, and process payments.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-secondary">Cached home</Link>
            <Link href="/menu" className="btn-primary">Cached menu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
