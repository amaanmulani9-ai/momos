'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  async function sendOtp() {
    if (!supabase) {
      setMessage('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use phone login.');
      return;
    }
    const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/^\+?/, '')}`;
    if (normalized.length < 10) {
      setMessage('Enter a valid phone number with country code (e.g. +91800…).');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Check your phone for the OTP code.');
    setStep('otp');
    setResendIn(30);
  }

  async function verifyOtp() {
    if (!supabase) return;
    const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/^\+?/, '')}`;
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: otp.trim(),
      type: 'sms',
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    window.location.href = '/profile';
  }

  return (
    <div className="app-page">
      <div className="app-container mx-auto max-w-md">
        <p className="section-kicker">Account</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Phone sign-in</h1>
        <p className="mt-2 text-sm text-white/55">
          Uses Supabase Auth (enable Phone provider + SMS in your Supabase project).
        </p>

        <div className="surface-card mt-8 space-y-5 rounded-[32px] p-6">
          {!supabase ? (
            <p className="text-sm text-[#ffb8bf]">Supabase environment variables are missing.</p>
          ) : step === 'phone' ? (
            <>
              <div>
                <label htmlFor="login-phone" className="form-label">Phone</label>
                <input
                  id="login-phone"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  inputMode="tel"
                />
              </div>
              <button type="button" className="btn-primary w-full" disabled={loading} onClick={() => void sendOtp()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="login-otp" className="form-label">One-time code</label>
                <input
                  id="login-otp"
                  className="form-input tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  inputMode="numeric"
                />
              </div>
              <button type="button" className="btn-primary w-full" disabled={loading} onClick={() => void verifyOtp()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & continue'}
              </button>
              <button
                type="button"
                className="text-sm text-white/50 underline disabled:opacity-40"
                disabled={loading || resendIn > 0}
                onClick={() => void sendOtp()}
              >
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </button>
              <button type="button" className="text-sm text-white/50 underline" onClick={() => setStep('phone')}>
                Change number
              </button>
            </>
          )}
          {message && <p className="text-sm text-white/65">{message}</p>}
        </div>

        <p className="mt-6 text-center text-sm text-white/45">
          <Link href="/profile" className="text-[#ffb08a] hover:underline">Back to profile</Link>
        </p>
      </div>
    </div>
  );
}
