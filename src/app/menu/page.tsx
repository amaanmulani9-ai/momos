import MenuPageView from '@/components/customer/MenuPageView';
import { getCategories, getProducts } from '@/lib/customer-data';

interface MenuPageProps {
  searchParams: Promise<{ cat?: string; q?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [categories, products, params] = await Promise.all([
    getCategories(),
    getProducts(),
    searchParams,
  ]);

  return (
    <MenuPageView
      categories={categories}
      products={products}
      initialCategory={params.cat}
      initialQuery={params.q}
    />
  );
}

