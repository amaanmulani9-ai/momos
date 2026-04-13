import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseEnv } from '@/lib/supabase/config';

const STATUS_ORDER = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;

async function getServiceSupabaseClient() {
  const config = getServiceSupabaseEnv();
  if (!config) {
    return null;
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(config.url, config.key);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderId?: string; nextStatus?: string };
    if (!body.orderId || !body.nextStatus) {
      return NextResponse.json({ success: false, message: 'orderId and nextStatus are required.' }, { status: 400 });
    }
    if (!STATUS_ORDER.includes(body.nextStatus as (typeof STATUS_ORDER)[number])) {
      return NextResponse.json({ success: false, message: 'Unsupported status value.' }, { status: 400 });
    }

    const serviceClient = await getServiceSupabaseClient();
    if (!serviceClient) {
      return NextResponse.json({ success: false, message: 'Supabase not configured.' }, { status: 503 });
    }

    const { data: current, error: fetchError } = await serviceClient
      .from('orders')
      .select('order_status')
      .eq('id', body.orderId)
      .limit(1)
      .maybeSingle();
    if (fetchError || !current) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const currentIndex = STATUS_ORDER.indexOf(String(current.order_status) as (typeof STATUS_ORDER)[number]);
    const nextIndex = STATUS_ORDER.indexOf(body.nextStatus as (typeof STATUS_ORDER)[number]);
    const skipForward = nextIndex > currentIndex + 1 && body.nextStatus !== 'cancelled';
    if (skipForward) {
      return NextResponse.json(
        { success: false, message: 'Invalid transition. Move step-by-step or cancel order.' },
        { status: 400 },
      );
    }

    const { error } = await serviceClient
      .from('orders')
      .update({ order_status: body.nextStatus })
      .eq('id', body.orderId);

    if (error) {
      return NextResponse.json({ success: false, message: 'Failed to update order status.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to update order status.' }, { status: 500 });
  }
}
