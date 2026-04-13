import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

async function getServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured.' }, { status: 503 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    app_order_id?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, app_order_id } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !app_order_id) {
    return NextResponse.json({ error: 'Missing verification fields.' }, { status: 400 });
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const serviceClient = await getServiceSupabaseClient();
  if (serviceClient) {
    await serviceClient
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', app_order_id);
  }

  return NextResponse.json({ success: true });
}
