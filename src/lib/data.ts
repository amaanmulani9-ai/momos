export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';

/** Stable IDs used in Supabase seed migration `supabase/migrations/20250413120000_marketplace.sql`. */
export const RESTAURANT_IDS = {
  MOMOS: 'meghna-momos',
  WOK: 'wok-express',
  SLICE: 'slice-run',
} as const;

export interface Restaurant {
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
  sortOrder: number;
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: RESTAURANT_IDS.MOMOS,
    slug: 'meghna-momos',
    name: "Meghna's Momos",
    tagline: 'Steam, fried & kurkure favourites',
    heroImageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
    cuisines: ['Momos', 'Indian', 'Healthy'],
    rating: 4.8,
    etaMin: 28,
    deliveryFee: 30,
    freeDeliveryAbove: 300,
    isOpen: true,
    sortOrder: 0,
  },
  {
    id: RESTAURANT_IDS.WOK,
    slug: 'wok-express',
    name: 'Wok Express',
    tagline: 'Asian bowls, noodles & pasta',
    heroImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    cuisines: ['Chinese', 'Asian', 'Pasta'],
    rating: 4.5,
    etaMin: 32,
    deliveryFee: 40,
    freeDeliveryAbove: 350,
    isOpen: true,
    sortOrder: 1,
  },
  {
    id: RESTAURANT_IDS.SLICE,
    slug: 'slice-run',
    name: 'Slice Run',
    tagline: 'Pizza & fast food',
    heroImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    cuisines: ['Pizza', 'Fast food'],
    rating: 4.3,
    etaMin: 35,
    deliveryFee: 45,
    freeDeliveryAbove: 400,
    isOpen: true,
    sortOrder: 2,
  },
];

export function restaurantIdForProductCategory(categoryId: string): string {
  if (['chinese', 'asian', 'pasta'].includes(categoryId)) {
    return RESTAURANT_IDS.WOK;
  }
  if (['pizza', 'fastfood'].includes(categoryId)) {
    return RESTAURANT_IDS.SLICE;
  }
  return RESTAURANT_IDS.MOMOS;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  spiceLevel: SpiceLevel;
  featured: boolean;
  isVeg: boolean;
  servings: string;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', emoji: '🍽️', sortOrder: 0 },
  { id: 'indian', name: 'Indian Varieties', emoji: '🇮🇳', sortOrder: 1 },
  { id: 'asian', name: 'Asian Specials', emoji: '🌏', sortOrder: 2 },
  { id: 'steam', name: 'Steam Momos', emoji: '♨️', sortOrder: 3 },
  { id: 'fried', name: 'Fried Momos', emoji: '🔥', sortOrder: 4 },
  { id: 'kurkure', name: 'Kurkure Momos', emoji: '✨', sortOrder: 5 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', sortOrder: 6 },
  { id: 'chinese', name: 'Chinese', emoji: '🍜', sortOrder: 7 },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', sortOrder: 8 },
  { id: 'fastfood', name: 'Fast Food', emoji: '🍔', sortOrder: 9 },
  { id: 'healthy', name: 'Healthy', emoji: '🥗', sortOrder: 10 },
  { id: 'luxury', name: 'Luxury', emoji: '👑', sortOrder: 11 },
  { id: 'combo', name: 'Combos', emoji: '🎉', sortOrder: 12 },
  { id: 'drinks', name: 'Drinks', emoji: '🥤', sortOrder: 13 },
];

export const PRODUCTS: Product[] = [
  // Steam Momos
  {
    id: '1',
    name: 'Classic Veg Steam Momos',
    slug: 'classic-veg-steam-momos',
    description: 'Handcrafted dumplings stuffed with fresh cabbage, carrots, and aromatic spices. Served with our signature red chilli chutney.',
    price: 80,
    imageUrl: '/images/veg-steam.jpg',
    category: 'steam',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: 'Bestseller',
  },
  {
    id: '2',
    name: 'Paneer Steam Momos',
    slug: 'paneer-steam-momos',
    description: 'Soft, pillowy dumplings packed with creamy paneer, fresh herbs, and a blend of Indian spices.',
    price: 100,
    imageUrl: '/images/paneer-steam.jpg',
    category: 'steam',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
  },
  {
    id: '3',
    name: 'Chicken Steam Momos',
    slug: 'chicken-steam-momos',
    description: 'Juicy minced chicken with garlic, ginger, and spring onions wrapped in our thin, delicate dough.',
    price: 120,
    imageUrl: '/images/chicken-steam.jpg',
    category: 'steam',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: false,
    servings: '6 pcs',
    badge: 'Most Loved',
  },
  // Fried Momos
  {
    id: '4',
    name: 'Crispy Veg Fried Momos',
    slug: 'crispy-veg-fried-momos',
    description: 'Golden-crispy fried dumplings with a crunchy exterior and flavorful veg filling. Irresistible with our mint chutney.',
    price: 100,
    imageUrl: '/images/veg-fried.jpg',
    category: 'fried',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
  },
  {
    id: '5',
    name: 'Spicy Chicken Fried Momos',
    slug: 'spicy-chicken-fried-momos',
    description: 'Deep-fried to perfection with spicy chicken stuffing. A crowd-pleaser for all the spice lovers out there.',
    price: 140,
    imageUrl: '/images/chicken-fried.jpg',
    category: 'fried',
    isAvailable: true,
    spiceLevel: 'hot',
    featured: true,
    isVeg: false,
    servings: '6 pcs',
    badge: '🔥 Must Try',
  },
  // Kurkure Momos
  {
    id: '6',
    name: 'Kurkure Veg Momos',
    slug: 'kurkure-veg-momos',
    description: 'Extra-crunchy momos coated with broken noodles and fried till perfectly golden. A unique twist you\'ll love.',
    price: 120,
    imageUrl: '/images/kurkure-veg.jpg',
    category: 'kurkure',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: 'New',
  },
  {
    id: '7',
    name: 'Kurkure Chicken Momos',
    slug: 'kurkure-chicken-momos',
    description: 'Succulent chicken stuffing inside a super-crunchy noodle-coated shell. The crunchiest momos in town!',
    price: 150,
    imageUrl: '/images/kurkure-chicken.jpg',
    category: 'kurkure',
    isAvailable: true,
    spiceLevel: 'hot',
    featured: false,
    isVeg: false,
    servings: '6 pcs',
  },

  // ─── Asian Specials ───────────────────────────────────────────
  {
    id: '12',
    name: 'Jhol Momo (Nepali Style)',
    slug: 'jhol-momo-nepali',
    description: 'Steamed momos dunked in a rich, tangy Nepali sesame-tomato soup. The authentic Kathmandu street-food experience — warming, spicy, and deeply comforting.',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'hot',
    featured: true,
    isVeg: true,
    servings: '6 pcs + jhol',
    badge: '🇳🇵 Nepali Fav',
  },
  {
    id: '13',
    name: 'Tibetan Thenthuk Momo',
    slug: 'tibetan-thenthuk-momo',
    description: 'Thick, hand-pulled Tibetan dumplings cooked in a hearty vegetable broth with dried yak cheese and Himalayan spices. A monastery classic.',
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: true,
    servings: '5 pcs + broth',
    badge: '🏔️ Tibetan Style',
  },
  {
    id: '14',
    name: 'Gyoza (Japanese Style)',
    slug: 'gyoza-japanese',
    description: 'Thin, delicate wrappers filled with pork & cabbage, pan-fried potsticker style — crispy on the bottom, steamed on top. Served with ponzu dipping sauce.',
    price: 170,
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: false,
    servings: '6 pcs',
    badge: '🇯🇵 Japan Fav',
  },
  {
    id: '15',
    name: 'Veg Gyoza',
    slug: 'veg-gyoza',
    description: 'Pan-fried Japanese-style dumplings stuffed with tofu, shiitake mushrooms, glass noodles, and fragrant sesame oil. Crispy base, soft top.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
  },
  {
    id: '16',
    name: 'Mandu (Korean Style)',
    slug: 'mandu-korean',
    description: 'Plump Korean dumplings filled with kimchi, glass noodles, tofu, and seasoned pork. Steamed or fried. Served with gochujang chilli dip.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: false,
    servings: '6 pcs',
    badge: '🇰🇷 Korea Fav',
  },
  {
    id: '17',
    name: 'Siu Mai (Cantonese Open-Top)',
    slug: 'siu-mai-cantonese',
    description: 'Open-faced dim-sum dumplings with a prawn and pork filling, topped with a single roe pearl. A Hong Kong yum-cha classic.',
    price: 190,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: false,
    servings: '4 pcs',
    badge: '🍤 Dim Sum',
  },
  {
    id: '18',
    name: 'Sichuan Chilli Oil Momos',
    slug: 'sichuan-chilli-oil-momos',
    description: 'Steamed dumplings drenched in a mouth-numbing Sichuan ma-la oil, black vinegar, and crispy garlic. Not for the faint-hearted!',
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'extra-hot',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🌶️🌶️ Danger Zone',
  },
  {
    id: '19',
    name: 'Thai Lemongrass Dumplings',
    slug: 'thai-lemongrass-dumplings',
    description: 'Steamed dumplings with a fragrant filling of lemongrass, galangal, kaffir lime, and prawns. Served with sweet chilli sauce.',
    price: 175,
    imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: false,
    isVeg: false,
    servings: '5 pcs',
    badge: '🇹🇭 Thai Twist',
  },
  {
    id: '20',
    name: 'Mongolian Buuz',
    slug: 'mongolian-buuz',
    description: 'Large Mongolian steamed dumplings stuffed with seasoned mutton and onion, traditionally eaten during Tsagaan Sar. Rich and hearty.',
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1604909052434-682e0a63d9d7?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: false,
    servings: '4 pcs',
    badge: '🇲🇳 Mongolian',
  },
  {
    id: '21',
    name: 'Tandoori Baked Momos',
    slug: 'tandoori-baked-momos',
    description: 'Our signature fusion — steam-cooked momos marinated in tandoori masala, then baked in a clay oven. Smoky, charred, and completely unique.',
    price: 160,
    originalPrice: 190,
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80',
    category: 'asian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🔥 Chef Special',
  },

  // ─── Indian Varieties ────────────────────────────────────────────
  {
    id: '22',
    name: 'Kothey Momo (Pan-Fried Flat)',
    slug: 'kothey-momo',
    description: 'Half-fried, half-steamed Nepalese-origin momos with a golden crispy base and soft top. A Darjeeling & Sikkim street staple that conquered all of India.',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🏔️ Darjeeling Hit',
  },
  {
    id: '23',
    name: 'C-Momo (Chocolate Momo)',
    slug: 'c-momo-chocolate',
    description: 'Sikkim\'s quirky dessert momo — sweet dough filled with dark chocolate ganache and crushed nuts, dusted with cocoa powder. A must-try.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🍫 Dessert Special',
  },
  {
    id: '24',
    name: 'Palak (Spinach) Momos',
    slug: 'palak-momos',
    description: 'Green-hued dough made with purée of fresh spinach, stuffed with spiced cottage cheese & herbs. Healthy, vibrant, and absolutely delicious.',
    price: 100,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
    badge: '🥬 Healthy',
  },
  {
    id: '25',
    name: 'Corn & Cheese Momos',
    slug: 'corn-cheese-momos',
    description: 'Sweet American corn kernels mixed with melty processed cheese and herbs, stuffed in soft steamed dough. Kids\' absolute favourite!',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
    badge: '🌽 Kids Fav',
  },
  {
    id: '26',
    name: 'Schezwan Fried Momos',
    slug: 'schezwan-fried-momos',
    description: 'Deep-fried momos tossed in fiery Schezwan sauce with bell peppers, spring onion, and garlic. Indo-Chinese street food at its finest.',
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'hot',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🌶️ Street Fav',
  },
  {
    id: '27',
    name: 'Aloo Tikka Momos',
    slug: 'aloo-tikka-momos',
    description: 'Spiced mashed potato filling with coriander and dry mango powder, pan-fried to a tikka-style crust. The comfort food you never knew you needed.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
  },
  {
    id: '28',
    name: 'Mushroom & Cheese Momos',
    slug: 'mushroom-cheese-momos',
    description: 'Earthy sautéed button mushrooms and gooey mozzarella stuffed in steamed wrappers. A café-style upgrade to the humble momo.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
  },
  {
    id: '29',
    name: 'Butter Chicken Momos',
    slug: 'butter-chicken-momos',
    description: 'Tender chicken tikka filling drenched in our in-house creamy butter masala sauce, wrapped and steamed. The best of two worlds.',
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: false,
    servings: '6 pcs',
    badge: '🍗 Fusion Hit',
  },
  {
    id: '30',
    name: 'Keema Momo (Minced Mutton)',
    slug: 'keema-momo',
    description: 'Generously stuffed with spiced minced mutton (keema), green chillies, ginger-garlic paste, and a squeeze of lime. A Kolkata favourite.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'hot',
    featured: false,
    isVeg: false,
    servings: '6 pcs',
    badge: '🐑 Kolkata Style',
  },
  {
    id: '31',
    name: 'Paneer Tikka Momos',
    slug: 'paneer-tikka-momos',
    description: 'Marinated smoky paneer tikka crumbles with capsicum and onion stuffed in soft wrappers, baked in the oven. Tandoor-meets-momo.',
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '♨️ Tandoor Fusion',
  },
  {
    id: '32',
    name: 'Dal (Lentil) Momos',
    slug: 'dal-momos',
    description: 'A humble Himalayan tradition — thick yellow lentil filling spiced with turmeric and cumin, stuffed in wholemeal-dough wrappers.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '6 pcs',
    badge: '🌿 Traditional',
  },
  {
    id: '33',
    name: 'Afgani Momos (White Gravy)',
    slug: 'afgani-momos',
    description: 'Steamed chicken momos drowned in a rich, cream-based white gravy with cashews, cardamom, and saffron. North India\'s most indulgent momo dish.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: true,
    isVeg: false,
    servings: '6 pcs + gravy',
    badge: '👑 Luxury Pick',
  },
  {
    id: '34',
    name: 'Momo Chaat',
    slug: 'momo-chaat',
    description: 'Crispy fried momos broken and topped with yoghurt, tamarind chutney, sev, pomegranate, and chaat masala. Delhi street food reimagined.',
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: true,
    servings: '6 pcs',
    badge: '🎊 Delhi Special',
  },
  {
    id: '35',
    name: 'Open Basket Momos',
    slug: 'open-basket-momos',
    description: 'Open-top basket-shaped dumplings piled with colourful veggies or egg bhurji, then steamed and served in the basket itself. An Instagram favourite.',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80',
    category: 'indian',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '4 pcs',
    badge: '📸 Instagram Hit',
  },

  // ─── Pizza ────────────────────────────────────────────────────────
  {
    id: '36', name: 'Margherita Pizza', slug: 'margherita-pizza',
    description: 'Classic wood-fired Margherita with San Marzano tomato sauce, fresh mozzarella, and hand-torn basil. Simple perfection.',
    price: 249, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'mild', featured: true, isVeg: true, servings: '8" personal', badge: '🍕 Classic',
  },
  {
    id: '37', name: 'Paneer Tikka Pizza', slug: 'paneer-tikka-pizza',
    description: 'An Indian twist on pizza — tandoori-marinated paneer cubes, diced capsicum, onion rings on a spiced masala base with mozzarella.',
    price: 299, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: true, servings: '8" personal', badge: '🇮🇳 Desi Hit',
  },
  {
    id: '38', name: 'BBQ Chicken Pizza', slug: 'bbq-chicken-pizza',
    description: 'Smoky BBQ-glazed chicken strips with red onion, jalapeños and a drizzle of sriracha mayo on a cheesy mozzarella base.',
    price: 349, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: false, servings: '8" personal', badge: '🔥 Must Try',
  },
  {
    id: '39', name: 'Double Cheese Burst', slug: 'double-cheese-burst-pizza',
    description: 'Cheese-stuffed crust oozing with mozzarella, loaded with three kinds of cheese on top. Every bite is a cheese pull moment.',
    price: 399, originalPrice: 449, imageUrl: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '10" medium', badge: '🧀 Cheese Lover',
  },
  {
    id: '40', name: 'Pepperoni Pizza', slug: 'pepperoni-pizza',
    description: 'Classic American-style pepperoni pizza with generous slices of spicy pepperoni, mozzarella, and tangy tomato sauce.',
    price: 379, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'medium', featured: false, isVeg: false, servings: '8" personal',
  },
  {
    id: '41', name: 'Mushroom & Truffle Pizza', slug: 'mushroom-truffle-pizza',
    description: 'Gourmet pizza with wild mushroom mix, truffle oil drizzle, rocket leaves and shaved parmesan — our most luxurious pizza.',
    price: 449, imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&q=80',
    category: 'pizza', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '8" personal', badge: '👑 Gourmet',
  },

  // ─── Chinese ──────────────────────────────────────────────────────
  {
    id: '42', name: 'Veg Hakka Noodles', slug: 'veg-hakka-noodles',
    description: 'Wok-tossed thin noodles with colourful vegetables in a soy-garlic-chilli sauce. The staple Indo-Chinese dish done right.',
    price: 150, imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: true, servings: '1 plate', badge: '🍜 Street Classic',
  },
  {
    id: '43', name: 'Chicken Chowmein', slug: 'chicken-chowmein',
    description: 'Egg noodles with juicy chicken strips, bean sprouts, spring onions, in a dark soy and oyster sauce. A filling favourite.',
    price: 190, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: false, servings: '1 plate',
  },
  {
    id: '44', name: 'Veg Manchurian (Gravy)', slug: 'veg-manchurian-gravy',
    description: 'Crispy vegetable dumplings in a thick, tangy, spicy Manchurian gravy. The quintessential Indo-Chinese comfort dish.',
    price: 160, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'hot', featured: false, isVeg: true, servings: '8-10 pcs + gravy',
  },
  {
    id: '45', name: 'Spring Rolls (6 pcs)', slug: 'spring-rolls',
    description: 'Golden, super-crunchy spring rolls filled with glass noodles, cabbage, carrot and sesame. Served with sweet chilli dip.',
    price: 130, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76538890b6b?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '6 pcs', badge: '✨ Crunchy',
  },
  {
    id: '46', name: 'Chicken Fried Rice', slug: 'chicken-fried-rice',
    description: 'Wok-smoked egg fried rice with diced chicken, green peas, and spring onion in light soy. Restaurant quality, street price.',
    price: 180, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: false, servings: '1 plate',
  },
  {
    id: '47', name: 'Kung Pao Tofu', slug: 'kung-pao-tofu',
    description: 'Crispy tofu cubes tossed in a fiery Sichuan-inspired Kung Pao sauce with roasted peanuts, dried chillies and scallions.',
    price: 200, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80',
    category: 'chinese', isAvailable: true, spiceLevel: 'extra-hot', featured: false, isVeg: true, servings: '1 plate', badge: '🌶️🌶️ Spicy',
  },

  // ─── Pasta ────────────────────────────────────────────────────────
  {
    id: '48', name: 'Penne Arrabiata', slug: 'penne-arrabiata',
    description: 'Penne in a bold, rustic tomato sauce fired up with red chilli flakes, garlic, and fresh basil. Simple, satisfying Italian.',
    price: 220, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80',
    category: 'pasta', isAvailable: true, spiceLevel: 'hot', featured: true, isVeg: true, servings: '1 bowl', badge: '🌶️ Spicy Italian',
  },
  {
    id: '49', name: 'Creamy Alfredo', slug: 'creamy-alfredo',
    description: 'Fettuccine coated in a rich parmesan cream sauce with a hint of nutmeg. Topped with black pepper and fresh parsley.',
    price: 250, imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&q=80',
    category: 'pasta', isAvailable: true, spiceLevel: 'mild', featured: true, isVeg: true, servings: '1 bowl', badge: '🧀 Creamy',
  },
  {
    id: '50', name: 'Chicken Pesto Pasta', slug: 'chicken-pesto-pasta',
    description: 'Grilled chicken strips tossed with fusilli, homemade basil pesto, sun-dried tomatoes, and pine nuts. Fresh and herby.',
    price: 290, imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80',
    category: 'pasta', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: false, servings: '1 bowl',
  },
  {
    id: '51', name: 'Rose Sauce Pasta', slug: 'rose-sauce-pasta',
    description: 'A beautiful blend of tomato and cream sauce with sautéed mushrooms and capsicum on penne. The crowd favourite.',
    price: 240, imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80',
    category: 'pasta', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '1 bowl', badge: '🌹 Popular',
  },

  // ─── Fast Food ────────────────────────────────────────────────────
  {
    id: '52', name: 'Crispy Chicken Burger', slug: 'crispy-chicken-burger',
    description: 'Double-fried crispy chicken thigh patty with coleslaw, pickles, and sriracha mayo in a toasted brioche bun. Legendary.',
    price: 220, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    category: 'fastfood', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: false, servings: '1 burger', badge: '🍔 Fan Fav',
  },
  {
    id: '53', name: 'Veg Aloo Tikki Burger', slug: 'veg-aloo-tikki-burger',
    description: 'Spiced potato & green pea tikki with mint chutney, sliced onions, and a creamy sriracha drizzle. Desi street style.',
    price: 140, imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80',
    category: 'fastfood', isAvailable: true, spiceLevel: 'medium', featured: false, isVeg: true, servings: '1 burger',
  },
  {
    id: '54', name: 'Chicken Wrap', slug: 'chicken-wrap',
    description: 'Grilled chicken strips, crunchy lettuce, tomato, cheese and chipotle sauce rolled in a soft flour tortilla.',
    price: 180, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80',
    category: 'fastfood', isAvailable: true, spiceLevel: 'medium', featured: false, isVeg: false, servings: '1 wrap',
  },
  {
    id: '55', name: 'Loaded Fries', slug: 'loaded-fries',
    description: 'Crispy shoestring fries loaded with nacho cheese sauce, jalapeños, sour cream, and crispy bacon bits. Fully loaded!',
    price: 160, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
    category: 'fastfood', isAvailable: true, spiceLevel: 'medium', featured: true, isVeg: false, servings: '1 portion', badge: '🔥 Loaded',
  },
  {
    id: '56', name: 'Samosa Chaat Plate', slug: 'samosa-chaat-plate',
    description: 'Crispy samosas broken open and smothered with chhole, tamarind chutney, green chutney, sev and chaat masala.',
    price: 120, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
    category: 'fastfood', isAvailable: true, spiceLevel: 'medium', featured: false, isVeg: true, servings: '2 samosas',
  },

  // ─── Healthy ──────────────────────────────────────────────────────
  {
    id: '57', name: 'Quinoa Power Bowl', slug: 'quinoa-power-bowl',
    description: 'Tri-colour quinoa with roasted sweet potato, edamame, avocado, cucumber, and a lemon-tahini dressing. Nourishing and filling.',
    price: 280, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    category: 'healthy', isAvailable: true, spiceLevel: 'mild', featured: true, isVeg: true, servings: '1 bowl', badge: '💪 High Protein',
  },
  {
    id: '58', name: 'Fresh Garden Salad', slug: 'fresh-garden-salad',
    description: 'Seasonal greens, cherry tomatoes, cucumber, olives, feta cheese, and croutons in a classic lemon-herb vinaigrette.',
    price: 180, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    category: 'healthy', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '1 bowl', badge: '🥗 Fresh',
  },
  {
    id: '59', name: 'Grilled Chicken Bowl', slug: 'grilled-chicken-bowl',
    description: 'Herb-marinated grilled chicken breast over brown rice with steamed broccoli, carrot ribbons and a light yoghurt dressing.',
    price: 320, imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    category: 'healthy', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: false, servings: '1 bowl', badge: '✅ Clean Eat',
  },
  {
    id: '60', name: 'Acai Smoothie Bowl', slug: 'acai-smoothie-bowl',
    description: 'Thick frozen acai blended with banana and almond milk, topped with granola, fresh berries, chia seeds and honey.',
    price: 260, imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80',
    category: 'healthy', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: true, servings: '1 bowl', badge: '🫐 Superfood',
  },

  // ─── Luxury ───────────────────────────────────────────────────────
  {
    id: '61', name: 'Truffle Risotto', slug: 'truffle-risotto',
    description: 'Handmade arborio rice risotto slow-cooked with black truffle shavings, parmesan, and a drizzle of white truffle oil. Michelin-inspired.',
    price: 580, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
    category: 'luxury', isAvailable: true, spiceLevel: 'mild', featured: true, isVeg: true, servings: '1 portion', badge: '🍄 Executive',
  },
  {
    id: '62', name: 'Grilled Chicken Steak', slug: 'grilled-chicken-steak',
    description: 'Free-range chicken breast in a mushroom-peppercorn sauce with truffle mash and grilled asparagus. A fine dining experience.',
    price: 650, imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=80',
    category: 'luxury', isAvailable: true, spiceLevel: 'mild', featured: true, isVeg: false, servings: '1 plate', badge: '⭐ Fine Dining',
  },
  {
    id: '63', name: 'Prawn Butter Garlic', slug: 'prawn-butter-garlic',
    description: 'Jumbo tiger prawns pan-seared in a decadent butter, white wine, and roasted garlic reduction. Served with artisan bread.',
    price: 720, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
    category: 'luxury', isAvailable: true, spiceLevel: 'mild', featured: false, isVeg: false, servings: '6 prawns + bread', badge: '🦐 Seafood',
  },

  // Combos
  {
    id: '8',
    name: 'Party Platter (Mix)',
    slug: 'party-platter-mix',
    description: '12 pcs of our bestselling momos — 4 veg steam, 4 chicken fried, 4 kurkure veg. Party in your mouth!',
    price: 280,
    originalPrice: 340,
    imageUrl: '/images/party-platter.jpg',
    category: 'combo',
    isAvailable: true,
    spiceLevel: 'medium',
    featured: true,
    isVeg: false,
    servings: '12 pcs',
    badge: '🎉 Best Value',
  },
  {
    id: '9',
    name: 'Veg Combo Meal',
    slug: 'veg-combo-meal',
    description: '6 veg steam momos + 6 veg fried momos + 1 soft drink. The complete momo meal for one.',
    price: 220,
    originalPrice: 260,
    imageUrl: '/images/veg-combo.jpg',
    category: 'combo',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '12 pcs + drink',
  },
  // Drinks
  {
    id: '10',
    name: 'Masala Chai',
    slug: 'masala-chai',
    description: 'Hot, spiced masala chai brewed the traditional way. Perfect companion to your momos.',
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80',
    category: 'drinks',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '250ml',
  },
  {
    id: '11',
    name: 'Cold Drink (Pepsi/7UP)',
    slug: 'cold-drink',
    description: 'Chilled Pepsi or 7UP to cool down after those spicy momos.',
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    category: 'drinks',
    isAvailable: true,
    spiceLevel: 'mild',
    featured: false,
    isVeg: true,
    servings: '250ml',
  },
];

export const SHOP_INFO = {
  name: "Meghna's Momos",
  tagline: 'Crafted with Heart. Packed with Flavor.',
  whatsapp: '918652304022',
  phone: '+91 86523 04022',
  address: 'Shop #12, Food Street, Sector 18, Noida, UP 201301',
  openTime: '11:00 AM',
  closeTime: '10:00 PM',
  deliveryRadius: '3 km',
  upiId: 'momos@upi',
  deliveryFee: 30,
  freeDeliveryAbove: 300,
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0!2d77.31!3d28.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM0JzEyLjAiTiA3N8KwMTgnMzYuMCJF!5e0!3m2!1sen!2sin!4v1234567890',
};

export const REVIEWS = [
  {
    id: '1',
    name: 'Priya Singh',
    avatar: 'PS',
    rating: 5,
    text: 'Best momos in Noida, hands down! The kurkure momos are absolutely addictive. I order twice a week 😍',
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    avatar: 'RS',
    rating: 5,
    text: 'Chicken steam momos are heaven. Fresh, juicy, and the chutney is fire 🔥. Delivery was super fast too!',
    date: '1 week ago',
  },
  {
    id: '3',
    name: 'Ananya Gupta',
    avatar: 'AG',
    rating: 5,
    text: 'Finally found my go-to momo spot. The party platter is amazing value. My whole family loves it!',
    date: '2 weeks ago',
  },
  {
    id: '4',
    name: 'Vikram Patel',
    avatar: 'VP',
    rating: 4,
    text: 'Paneer momos are so creamy and delicious. The packaging is also great, momos stay warm.',
    date: '3 weeks ago',
  },
];

export function generateWhatsAppMessage(
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  customer: { name: string; phone: string; address: string; payment: string }
): string {
  const itemsList = items
    .map((i) => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`)
    .join('\n');

  return encodeURIComponent(
    `🥟 *New Order - Meghna's Momos*\n\n` +
    `*Customer Details:*\n` +
    `Name: ${customer.name}\n` +
    `Phone: ${customer.phone}\n` +
    `Address: ${customer.address}\n` +
    `Payment: ${customer.payment}\n\n` +
    `*Order Details:*\n${itemsList}\n\n` +
    `*Total: ₹${total}*\n\n` +
    `Please confirm my order! 🙏`
  );
}
