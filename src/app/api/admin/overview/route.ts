import { NextResponse } from 'next/server';

async function getServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const serviceClient = await getServiceSupabaseClient();
    if (!serviceClient) {
      return NextResponse.json({
        metrics: { restaurants: 0, products: 0, openOrders: 0, revenue: 0 },
        restaurants: [],
        products: [],
        support: [],
      });
    }

    const [restaurantsRes, productsRes, ordersRes] = await Promise.all([
      serviceClient.from('restaurants').select('*').order('sort_order', { ascending: true }),
      serviceClient.from('products').select('*').order('sort_order', { ascending: true }).limit(200),
      serviceClient.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    const restaurants = restaurantsRes.data ?? [];
    const products = productsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const openOrders = orders.filter((o) =>
      ['confirmed', 'preparing', 'out_for_delivery'].includes(String(o.order_status)),
    ).length;
    const revenue = orders
      .filter((o) => String(o.order_status) !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    return NextResponse.json({
      metrics: {
        restaurants: restaurants.length,
        products: products.length,
        openOrders,
        revenue,
      },
      restaurants,
      products,
      support: orders
        .filter((o) => String(o.order_status) !== 'delivered')
        .slice(0, 12)
        .map((o) => ({
          id: o.id,
          customer_name: o.customer_name,
          order_status: o.order_status,
          created_at: o.created_at,
        })),
    });
  } catch {
    return NextResponse.json({
      metrics: { restaurants: 0, products: 0, openOrders: 0, revenue: 0 },
      restaurants: [],
      products: [],
      support: [],
    });
  }
}
