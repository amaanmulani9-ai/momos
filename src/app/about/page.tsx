'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChefHat, Heart, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
            <h1 className="section-title text-4xl sm:text-5xl gradient-text mb-6">
              Born from a <br />Love of Momos
            </h1>
            <p className="text-orange-100/60 leading-relaxed mb-4">
              What started as Meghna's passion project in her home kitchen has grown into Noida's most beloved momo spot. Every single momo is still handcrafted the old-fashioned way — with patience, good ingredients, and a whole lot of love.
            </p>
            <p className="text-orange-100/60 leading-relaxed mb-6">
              We believe street food should be accessible, affordable, and absolutely delicious. No shortcuts, no compromises — just the best dumplings you've ever had.
            </p>
            <Link href="/menu" className="btn-primary">
              Try Our Momos 🥟
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-80 rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(192,57,43,0.3)' }}>
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
                alt="Meghna's kitchen"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {[
            { icon: ChefHat, title: 'Expert Craft', desc: '5+ years of perfecting the perfect dumpling fold.', color: '#c0392b' },
            { icon: Heart, title: 'Made with Love', desc: 'Every batch is prepared with care and attention.', color: '#e74c3c' },
            { icon: Award, title: 'Premium Quality', desc: 'Only the freshest, locally-sourced ingredients.', color: '#e67e22' },
            { icon: Users, title: 'Community First', desc: 'Proudly serving 2,000+ happy families in Noida.', color: '#f39c12' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${color}22` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="font-bold text-orange-100 mb-2">{title}</h3>
              <p className="text-sm text-orange-100/50 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center p-10 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(192,57,43,0.2), rgba(230,126,34,0.1))', border: '1px solid rgba(192,57,43,0.3)' }}
        >
          <h2 className="section-title text-3xl gradient-text mb-4">Ready to taste the difference?</h2>
          <p className="text-orange-100/60 mb-6">Order online or drop by our shop in Sector 18, Noida.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/menu" className="btn-primary">Order Online</Link>
            <Link href="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
