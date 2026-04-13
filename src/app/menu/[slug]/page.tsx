import { notFound } from 'next/navigation';
import ProductDetailView from '@/components/customer/ProductDetailView';
import { getProductBySlug, getProducts, getReviews } from '@/lib/customer-data';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [products, reviews] = await Promise.all([
    getProducts(),
    getReviews(),
  ]);

  const relatedProducts = products.filter(
    (item) => item.categoryId === product.categoryId && item.id !== product.id,
  );

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
      variant="page"
    />
  );
}

