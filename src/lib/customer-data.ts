import {
  CATEGORIES as LEGACY_CATEGORIES,
  PRODUCTS as LEGACY_PRODUCTS,
  RESTAURANTS as LEGACY_RESTAURANTS,
  REVIEWS as LEGACY_REVIEWS,
  SHOP_INFO,
  restaurantIdForProductCategory,
  type Restaurant,
  type SpiceLevel,
} from '@/lib/data';
import { getPublicSupabaseEnv } from '@/lib/supabase/config';

export type { SpiceLevel };

export interface CategorySummary {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

export interface RestaurantSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImageUrl: string;
  cuisines: string[];
  rating: number;
  etaMin: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  isOpen: boolean;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  gallery: string[];
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  spiceLevel: SpiceLevel;
  featured: boolean;
  isVeg: boolean;
  servings: string;
  badge?: string;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantDeliveryFee: number;
  restaurantFreeDeliveryAbove: number;
}

export type ProductDetail = ProductSummary;

export interface ReviewRecord {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface ShopSettings {
  name: string;
  tagline: string;
  whatsapp: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
  deliveryRadius: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  upiId: string;
  mapEmbedUrl: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface OrderDraft {
  customerName: string;
  phone: string;
  email?: string;
  addressLabel?: string;
  area: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD' | 'UPI' | 'WhatsApp' | 'RAZORPAY';
  items: OrderLine[];
  couponCode?: string;
  couponSavings?: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  addressLabel?: string;
  area: string;
  address: string;
  notes?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  couponCode?: string;
  couponSavings?: number;
  createdAt: string;
  persisted: boolean;
  whatsappUrl?: string;
  restaurantId?: string;
  restaurantName?: string;
}

export interface CustomerProfile {
  name: string;
  phone: string;
}

const categoryMap = new Map(
  LEGACY_CATEGORIES.map((category) => [category.id, category.name]),
);

function mapLegacyRestaurant(r: Restaurant): RestaurantSummary {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    heroImageUrl: r.heroImageUrl,
    cuisines: [...r.cuisines],
    rating: r.rating,
    etaMin: r.etaMin,
    deliveryFee: r.deliveryFee,
    freeDeliveryAbove: r.freeDeliveryAbove,
    isOpen: r.isOpen,
  };
}

export const fallbackRestaurants: RestaurantSummary[] = LEGACY_RESTAURANTS.filter((r) => r.isOpen).map(mapLegacyRestaurant);

function restaurantFieldsForId(restaurantId: string): Pick<
  ProductDetail,
  'restaurantId' | 'restaurantSlug' | 'restaurantName' | 'restaurantDeliveryFee' | 'restaurantFreeDeliveryAbove'
> {
  const r = LEGACY_RESTAURANTS.find((x) => x.id === restaurantId) ?? LEGACY_RESTAURANTS[0];
  return {
    restaurantId: r.id,
    restaurantSlug: r.slug,
    restaurantName: r.name,
    restaurantDeliveryFee: r.deliveryFee,
    restaurantFreeDeliveryAbove: r.freeDeliveryAbove,
  };
}

export const fallbackCategories: CategorySummary[] = LEGACY_CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  emoji: category.emoji,
  sortOrder: category.sortOrder,
}));

export const fallbackProducts: ProductDetail[] = LEGACY_PRODUCTS.map((product) => {
  const rid = restaurantIdForProductCategory(product.category);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    longDescription: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    imageUrl: product.imageUrl,
    gallery: [product.imageUrl],
    categoryId: product.category,
    categoryName: categoryMap.get(product.category) ?? product.category,
    isAvailable: product.isAvailable,
    spiceLevel: product.spiceLevel,
    featured: product.featured,
    isVeg: product.isVeg,
    servings: product.servings,
    badge: product.badge,
    ...restaurantFieldsForId(rid),
  };
});

export const fallbackReviews: ReviewRecord[] = LEGACY_REVIEWS.map((review) => ({
  id: review.id,
  name: review.name,
  avatar: review.avatar,
  rating: review.rating,
  text: review.text,
  date: review.date,
}));

export const fallbackSettings: ShopSettings = {
  name: SHOP_INFO.name,
  tagline: SHOP_INFO.tagline,
  whatsapp: SHOP_INFO.whatsapp,
  phone: SHOP_INFO.phone,
  address: SHOP_INFO.address,
  openTime: SHOP_INFO.openTime,
  closeTime: SHOP_INFO.closeTime,
  deliveryRadius: SHOP_INFO.deliveryRadius,
  deliveryFee: SHOP_INFO.deliveryFee,
  freeDeliveryAbove: SHOP_INFO.freeDeliveryAbove,
  upiId: SHOP_INFO.upiId,
  mapEmbedUrl: SHOP_INFO.mapEmbedUrl,
};

function mapSupabaseRestaurantRow(row: Record<string, unknown>): RestaurantSummary {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? row.id ?? ''),
    name: String(row.name ?? ''),
    tagline: String(row.tagline ?? ''),
    heroImageUrl: String(row.hero_image_url ?? row.heroImageUrl ?? ''),
    cuisines: Array.isArray(row.cuisines) ? (row.cuisines as string[]) : [],
    rating: Number(row.rating ?? 4.5),
    etaMin: Number(row.eta_min ?? row.etaMin ?? 30),
    deliveryFee: Number(row.delivery_fee ?? row.deliveryFee ?? 30),
    freeDeliveryAbove: Number(row.free_delivery_above ?? row.freeDeliveryAbove ?? 300),
    isOpen: row.is_open !== false && row.isOpen !== false,
  };
}

function mapSupabaseProduct(record: Record<string, unknown>): ProductDetail {
  const categoryId = String(record.category_id ?? record.category ?? 'all');
  const imagePath = String(record.image_path ?? record.image_url ?? record.imageUrl ?? fallbackProducts[0]?.imageUrl ?? '');
  const imageUrl = imagePath.startsWith('http') || imagePath.startsWith('/')
    ? imagePath
    : `/${imagePath}`;

  const nested = record.restaurants as Record<string, unknown> | Record<string, unknown>[] | null | undefined;
  const restaurantRow = Array.isArray(nested) ? nested[0] : nested;
  const inferredRestaurantId = record.restaurant_id
    ? String(record.restaurant_id)
    : restaurantIdForProductCategory(categoryId);

  const restaurantBlock =
    restaurantRow && typeof restaurantRow === 'object' && restaurantRow.id
      ? {
          restaurantId: String(restaurantRow.id),
          restaurantSlug: String(restaurantRow.slug ?? restaurantRow.id),
          restaurantName: String(restaurantRow.name ?? ''),
          restaurantDeliveryFee: Number(restaurantRow.delivery_fee ?? 30),
          restaurantFreeDeliveryAbove: Number(restaurantRow.free_delivery_above ?? 300),
        }
      : restaurantFieldsForId(inferredRestaurantId);

  return {
    id: String(record.id ?? ''),
    slug: String(record.slug ?? ''),
    name: String(record.name ?? ''),
    description: String(record.description ?? ''),
    longDescription: String(record.long_description ?? record.description ?? ''),
    price: Number(record.price_inr ?? record.price ?? 0),
    originalPrice: record.original_price ? Number(record.original_price) : undefined,
    imageUrl,
    gallery: [imageUrl],
    categoryId,
    categoryName: categoryMap.get(categoryId) ?? categoryId,
    isAvailable: Boolean(record.is_available ?? true),
    spiceLevel: String(record.spice_level ?? 'medium') as SpiceLevel,
    featured: Boolean(record.is_featured ?? record.featured ?? false),
    isVeg: Boolean(record.is_veg ?? true),
    servings: String(record.servings ?? '1 serving'),
    badge: record.badge ? String(record.badge) : undefined,
    ...restaurantBlock,
  };
}

async function getPublicSupabaseClient() {
  const config = getPublicSupabaseEnv();
  if (!config) {
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(config.url, config.key);
}

export async function getRestaurants(): Promise<RestaurantSummary[]> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackRestaurants;
    }

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data?.length) {
      return fallbackRestaurants;
    }

    return data.map((row) => mapSupabaseRestaurantRow(row as Record<string, unknown>));
  } catch {
    return fallbackRestaurants;
  }
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantSummary | null> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackRestaurants.find((r) => r.slug === slug) ?? null;
    }

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return fallbackRestaurants.find((r) => r.slug === slug) ?? null;
    }

    return mapSupabaseRestaurantRow(data as Record<string, unknown>);
  } catch {
    return fallbackRestaurants.find((r) => r.slug === slug) ?? null;
  }
}

export async function getProductsByRestaurantSlug(slug: string): Promise<ProductDetail[]> {
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return [];
  }

  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackProducts.filter((p) => p.restaurantId === restaurant.id);
    }

    const withJoin = await client
      .from('products')
      .select('*, restaurants(*)')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order', { ascending: true });

    const query = withJoin.error
      ? await client.from('products').select('*').eq('restaurant_id', restaurant.id).order('sort_order', { ascending: true })
      : withJoin;

    const { data, error } = query;
    if (error || !data?.length) {
      return fallbackProducts.filter((p) => p.restaurantId === restaurant.id);
    }

    return data.map((row) => mapSupabaseProduct(row as Record<string, unknown>));
  } catch {
    return fallbackProducts.filter((p) => p.restaurantId === restaurant.id);
  }
}

export async function getSettings(): Promise<ShopSettings> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackSettings;
    }

    const { data, error } = await client.from('settings').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return fallbackSettings;
    }

    return {
      name: String(data.shop_name ?? data.name ?? fallbackSettings.name),
      tagline: String(data.tagline ?? data.banner_text ?? fallbackSettings.tagline),
      whatsapp: String(data.whatsapp_number ?? fallbackSettings.whatsapp),
      phone: String(data.phone ?? fallbackSettings.phone),
      address: String(data.address ?? fallbackSettings.address),
      openTime: String(data.open_time ?? fallbackSettings.openTime),
      closeTime: String(data.close_time ?? fallbackSettings.closeTime),
      deliveryRadius: String(data.delivery_radius ?? fallbackSettings.deliveryRadius),
      deliveryFee: Number(data.flat_delivery_fee ?? data.delivery_fee ?? fallbackSettings.deliveryFee),
      freeDeliveryAbove: Number(data.minimum_order ?? data.free_delivery_above ?? fallbackSettings.freeDeliveryAbove),
      upiId: String(data.upi_id ?? fallbackSettings.upiId),
      mapEmbedUrl: String(data.map_embed_url ?? data.map_place_url ?? fallbackSettings.mapEmbedUrl),
    };
  } catch {
    return fallbackSettings;
  }
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackCategories;
    }

    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data?.length) {
      return fallbackCategories;
    }

    return data.map((category) => ({
      id: String(category.id),
      name: String(category.name),
      emoji: String(category.emoji ?? '•'),
      sortOrder: Number(category.sort_order ?? 0),
    }));
  } catch {
    return fallbackCategories;
  }
}

export async function getProducts(): Promise<ProductDetail[]> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackProducts;
    }

    const withJoin = await client
      .from('products')
      .select('*, restaurants(*)')
      .order('sort_order', { ascending: true });

    const fallbackQuery = withJoin.error
      ? await client.from('products').select('*').order('sort_order', { ascending: true })
      : withJoin;

    const { data, error } = fallbackQuery;
    if (error || !data?.length) {
      return fallbackProducts;
    }

    return data.map((product) => mapSupabaseProduct(product as Record<string, unknown>));
  } catch {
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackProducts.find((product) => product.slug === slug) ?? null;
    }

    const withJoin = await client
      .from('products')
      .select('*, restaurants(*)')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    const query = withJoin.error
      ? await client.from('products').select('*').eq('slug', slug).limit(1).maybeSingle()
      : withJoin;

    const { data, error } = query;

    if (error || !data) {
      return fallbackProducts.find((product) => product.slug === slug) ?? null;
    }

    return mapSupabaseProduct(data as Record<string, unknown>);
  } catch {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getReviews(): Promise<ReviewRecord[]> {
  try {
    const client = await getPublicSupabaseClient();
    if (!client) {
      return fallbackReviews;
    }

    const { data, error } = await client
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error || !data?.length) {
      return fallbackReviews;
    }

    return data.map((review) => ({
      id: String(review.id),
      name: String(review.name ?? 'Guest'),
      avatar: String(review.avatar ?? String(review.name ?? 'G').slice(0, 2).toUpperCase()),
      rating: Number(review.rating ?? 5),
      text: String(review.text ?? ''),
      date: String(review.date_label ?? review.created_at ?? 'Recently'),
    }));
  } catch {
    return fallbackReviews;
  }
}
