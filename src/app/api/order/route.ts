import { NextRequest, NextResponse } from 'next/server';
import { fallbackSettings, type OrderRecord } from '@/lib/customer-data';
import { mapRemoteOrderRow } from '@/lib/map-remote-order';
import { getServiceSupabaseEnv } from '@/lib/supabase/config';

interface IncomingOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  item_price: number;
  image_url?: string;
}

function createOrderId() {
  return `MK-${Date.now().toString(36).toUpperCase()}`;
}

function buildWhatsAppUrl(payload: {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: IncomingOrderItem[];
  total: number;
}) {
  const lines = payload.items
    .map((item) => `- ${item.product_name} x ${item.quantity} = Rs.${item.item_price * item.quantity}`)
    .join('\n');

  const text = encodeURIComponent(
    `New order from ${payload.customerName}\n` +
    `Phone: ${payload.phone}\n` +
    `Address: ${payload.address}\n` +
    `Payment: ${payload.paymentMethod}\n\n` +
    `${lines}\n\n` +
    `Total: Rs.${payload.total}`,
  );

  return `https://wa.me/${fallbackSettings.whatsapp}?text=${text}`;
}

async function getServiceSupabaseClient() {
  const config = getServiceSupabaseEnv();
  if (!config) {
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(config.url, config.key);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      customer_name?: string;
      phone?: string;
      area?: string;
      address?: string;
      address_label?: string;
      notes?: string;
      payment_method?: string;
      subtotal?: number;
      delivery_fee?: number;
      total_amount?: number;
      coupon_code?: string;
      coupon_savings?: number;
      restaurant_id?: string;
      place_id?: string;
      latitude?: number;
      longitude?: number;
      user_id?: string;
      items?: IncomingOrderItem[];
    };

    if (!body.customer_name || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json(
        { success: false, message: 'Missing required order fields.' },
        { status: 400 },
      );
    }

    const fallbackOrderId = createOrderId();
    let orderId = fallbackOrderId;
    let persisted = false;

    const fullAddress = [
      body.address_label,
      body.area,
      body.address,
    ]
      .filter(Boolean)
      .join(', ');

    const subtotal =
      body.subtotal ??
      (body.total_amount ?? 0) - (body.delivery_fee ?? 0);

    const serviceClient = await getServiceSupabaseClient();
    if (serviceClient) {
      const insertRow: Record<string, unknown> = {
        customer_name: body.customer_name,
        phone: body.phone,
        address: fullAddress,
        payment_method: body.payment_method ?? 'COD',
        notes: body.notes ?? '',
        total_amount: body.total_amount ?? 0,
        order_status: 'confirmed',
        delivery_fee: body.delivery_fee ?? 0,
        subtotal,
        coupon_code: body.coupon_code ?? null,
        coupon_savings: body.coupon_savings ?? 0,
        payment_status: 'pending',
        restaurant_id: body.restaurant_id ?? null,
        place_id: body.place_id ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      };

      if (body.user_id) {
        insertRow.user_id = body.user_id;
      }

      const { data: orderRow, error: orderError } = await serviceClient
        .from('orders')
        .insert(insertRow)
        .select()
        .single();

      if (!orderError && orderRow) {
        orderId = String(orderRow.id);
        const { error: itemError } = await serviceClient.from('order_items').insert(
          body.items.map((item) => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            item_price: item.item_price,
          })),
        );

        if (!itemError) {
          persisted = true;
        }
      }
    }

    const whatsappUrl = buildWhatsAppUrl({
      customerName: body.customer_name,
      phone: body.phone,
      address: fullAddress,
      paymentMethod: body.payment_method ?? 'COD',
      items: body.items,
      total: body.total_amount ?? 0,
    });

    return NextResponse.json(
      {
        success: true,
        orderId,
        status: 'confirmed' satisfies OrderRecord['orderStatus'],
        persisted,
        whatsappUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to create order.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const serviceClient = await getServiceSupabaseClient();
    if (!serviceClient) {
      return NextResponse.json({ orders: [] });
    }

    const withJoin = await serviceClient
      .from('orders')
      .select('*, order_items(*), restaurants(id, name)')
      .order('created_at', { ascending: false })
      .limit(50);

    const listQuery = withJoin.error
      ? await serviceClient.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(50)
      : withJoin;

    const { data, error } = listQuery;

    if (error || !data) {
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: data });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
