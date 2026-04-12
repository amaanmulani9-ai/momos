import { NextRequest, NextResponse } from 'next/server';

// POST /api/order — saves order to Supabase (graceful if env not configured)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Supabase integration (optional — activated when env vars are set)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let dbSuccess = false;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase-url')) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: body.customer_name,
          phone: body.phone,
          address: body.address,
          payment_method: body.payment_method,
          notes: body.notes,
          total_amount: body.total_amount,
          order_status: 'pending',
        })
        .select()
        .single();

      if (!orderError && body.items && order) {
        await supabase.from('order_items').insert(
          body.items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            item_price: item.item_price,
          }))
        );
        dbSuccess = true;
      }
    }

    // N8N integration (Trigger N8N workflow for WhatsApp delivery)
    const n8nWebhook = process.env.N8N_WEBHOOK_URL;
    let n8nSuccess = false;

    if (n8nWebhook) {
      try {
        await fetch(n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        n8nSuccess = true;
      } catch (err) {
        console.error('N8N webhook failed:', err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order processing started',
      n8nSuccess,
      dbSuccess
    }, { status: 201 });
  } catch (err) {
    console.error('Order API error:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/order — fetch all orders (admin use)
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ orders: [] });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ orders: orders ?? [] });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
