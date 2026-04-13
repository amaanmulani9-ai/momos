import { notFound } from 'next/navigation';
import MenuPageView from '@/components/customer/MenuPageView';
import { getCategories, getProductsByRestaurantSlug, getRestaurantBySlug } from '@/lib/customer-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByRestaurantSlug(slug),
  ]);

  if (products.length === 0) {
    notFound();
  }

  return (
    <MenuPageView
      categories={categories}
      products={products}
      restaurant={restaurant}
    />
  );
}
