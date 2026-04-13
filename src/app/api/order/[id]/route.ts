import { NextResponse } from 'next/server';
import { mapRemoteOrderRow } from '@/lib/map-remote-order';
import { getServiceSupabaseEnv } from '@/lib/supabase/config';

async function getServiceSupabaseClient() {
  const config = getServiceSupabaseEnv();
  if (!config) {
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(config.url, config.key);
}

interface OrderRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: OrderRouteProps) {
  try {
    const { id } = await params;
    const serviceClient = await getServiceSupabaseClient();

    if (!serviceClient) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const withJoin = await serviceClient
      .from('orders')
      .select('*, order_items(*), restaurants(id, name)')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    const query = withJoin.error
      ? await serviceClient.from('orders').select('*, order_items(*)').eq('id', id).limit(1).maybeSingle()
      : withJoin;

    const { data, error } = query;

    if (error || !data) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order: mapRemoteOrderRow(data as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
  }
}
