import OrderDetailsPageView from '@/components/customer/OrderDetailsPageView';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return <OrderDetailsPageView orderId={id} />;
}

