import HomePageView from '@/components/home/HomePageView';
import { getCategories, getProducts, getRestaurants, getReviews, getSettings } from '@/lib/customer-data';

export default async function HomePage() {
  const [categories, products, reviews, settings, restaurants] = await Promise.all([
    getCategories(),
    getProducts(),
    getReviews(),
    getSettings(),
    getRestaurants(),
  ]);

  return (
    <HomePageView
      categories={categories}
      products={products}
      reviews={reviews}
      settings={settings}
      restaurants={restaurants}
    />
  );
}

