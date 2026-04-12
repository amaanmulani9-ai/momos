'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Loader2 } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'momos2024';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError('Incorrect password. Try again.');
    }
    setLoading(false);
  };

  if (authed) return <AdminDashboard />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-orange-100">Admin Panel</h1>
            <p className="text-orange-100/50 text-sm mt-1">Meghna's Momos — Owner Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="text-xs text-orange-100/50 font-medium mb-1 block">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl text-sm text-orange-100 placeholder-orange-100/30 outline-none focus:ring-2 focus:ring-orange-500/50"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading || !password}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Login'}
            </button>
          </form>

          <p className="text-xs text-orange-100/30 text-center mt-4">
            Default password: <code className="text-orange-400">momos2024</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
