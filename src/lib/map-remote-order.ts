import type { OrderRecord } from '@/lib/customer-data';

/** Map Supabase `orders` row (+ nested `order_items`, optional `restaurants`) to `OrderRecord`. */
export function mapRemoteOrderRow(data: Record<string, unknown>): OrderRecord {
  const items = Array.isArray(data.order_items)
    ? data.order_items.map((item) => ({
        productId: String((item as Record<string, unknown>).product_id ?? ''),
        name: String((item as Record<string, unknown>).product_name ?? ''),
        quantity: Number((item as Record<string, unknown>).quantity ?? 0),
        unitPrice: Number((item as Record<string, unknown>).item_price ?? 0),
        imageUrl: (item as Record<string, unknown>).image_url
          ? String((item as Record<string, unknown>).image_url)
          : undefined,
      }))
    : [];

  const deliveryFee = Number(data.delivery_fee ?? 0);
  const totalAmount = Number(data.total_amount ?? 0);
  const subtotalCol = data.subtotal != null ? Number(data.subtotal) : totalAmount - deliveryFee;

  const pay = String(data.payment_status ?? 'pending').toLowerCase();
  const paymentStatus: OrderRecord['paymentStatus'] = pay === 'paid' ? 'paid' : 'pending';

  const nested = data.restaurants as Record<string, unknown> | Record<string, unknown>[] | null | undefined;
  const r = Array.isArray(nested) ? nested[0] : nested;
  const restaurantId = data.restaurant_id ? String(data.restaurant_id) : r?.id ? String(r.id) : undefined;
  const restaurantName = r?.name ? String(r.name) : undefined;

  return {
    id: String(data.id ?? ''),
    customerName: String(data.customer_name ?? ''),
    phone: String(data.phone ?? ''),
    area: String((data as { area?: string }).area ?? ''),
    address: String(data.address ?? ''),
    notes: data.notes ? String(data.notes) : undefined,
    addressLabel: (data as { address_label?: string }).address_label
      ? String((data as { address_label?: string }).address_label)
      : undefined,
    paymentMethod: String(data.payment_method ?? 'COD'),
    paymentStatus,
    orderStatus: String(data.order_status ?? 'confirmed') as OrderRecord['orderStatus'],
    items,
    subtotal: subtotalCol,
    deliveryFee,
    totalAmount,
    couponCode: data.coupon_code ? String(data.coupon_code) : undefined,
    couponSavings: data.coupon_savings != null ? Number(data.coupon_savings) : undefined,
    createdAt: String(data.created_at ?? new Date().toISOString()),
    persisted: true,
    restaurantId,
    restaurantName,
  };
}
