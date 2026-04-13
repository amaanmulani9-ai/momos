import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseEnv } from '@/lib/supabase/config';

async function getServiceSupabaseClient() {
  const config = getServiceSupabaseEnv();
  if (!config) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(config.url, config.key);
}

export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay keys not configured.' }, { status: 503 });
  }

  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
  }

  const serviceClient = await getServiceSupabaseClient();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Orders require Supabase for Razorpay.' }, { status: 503 });
  }

  const { data: row, error } = await serviceClient.from('orders').select('id, total_amount').eq('id', orderId).maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const totalInr = Number((row as { total_amount?: number }).total_amount ?? 0);
  const amountPaise = Math.max(100, Math.round(totalInr * 100));

  const Razorpay = (await import('razorpay')).default;
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const rzOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: String(orderId).slice(0, 40),
    notes: { app_order_id: orderId },
  });

  const rzId = (rzOrder as { id?: string }).id;
  if (!rzId) {
    return NextResponse.json({ error: 'Razorpay did not return an order id.' }, { status: 502 });
  }

  await serviceClient.from('orders').update({ razorpay_order_id: rzId }).eq('id', orderId);

  return NextResponse.json({
    razorpayOrderId: rzId,
    keyId,
    amount: amountPaise,
    currency: 'INR',
  });
}
