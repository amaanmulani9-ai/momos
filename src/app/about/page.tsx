import Link from 'next/link';
import { Award, Clock3, ShieldCheck, Store } from 'lucide-react';
import { getSettings } from '@/lib/customer-data';

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="app-page">
      <div className="app-container space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-5">
            <p className="section-kicker">About the kitchen</p>
            <h1 className="section-title text-5xl text-white sm:text-6xl">A comfort-food kitchen designed around momos, speed, and repeat orders.</h1>
            <p className="section-copy max-w-2xl text-base">
              Meghna&apos;s Momos started with a simple idea: local delivery should feel as polished as a modern food app without losing the warmth of a neighborhood kitchen. The redesign keeps that same intent and gives it a cleaner, more trustworthy customer journey.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="btn-primary">Order now</Link>
              <Link href="/contact" className="btn-secondary">Contact kitchen</Link>
            </div>
          </div>

          <div className="surface-card rounded-[36px] p-7">
            <p className="section-kicker">Operating details</p>
            <div className="mt-6 space-y-4">
              {[
                { icon: Store, title: 'Kitchen location', detail: settings.address },
                { icon: Clock3, title: 'Open hours', detail: `${settings.openTime} - ${settings.closeTime}` },
                { icon: ShieldCheck, title: 'Ordering support', detail: 'COD, UPI, and WhatsApp confirmation remain available.' },
                { icon: Award, title: 'Food focus', detail: 'Momos first, with combos, noodles, pizza, and add-ons.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <Icon className="h-5 w-5 text-[#ff8a5b]" />
                    <p className="mt-4 text-lg font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-white/56">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

