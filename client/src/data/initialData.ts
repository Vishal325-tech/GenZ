export interface Product {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description: string;
  stock: number;
  category: string;
  subCategory?: string;
  images: string[];
  videos?: string[];
  ratingAverage: number;
  tags?: string[];
  reviews?: Array<{
    _id?: string;
    userName: string;
    rating: number;
    comment: string;
    approved: boolean;
    createdAt?: string;
    reply?: string;
    photo?: string;
    video?: string;
  }>;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  subCategories?: string[];
}

export interface MediaItem {
  _id: string;
  name: string;
  url: string;
  mimetype: string;
  category?: string;
  createdAt?: string;
  story?: any;
}

// Utility to convert image paths so they work both locally and on GitHub Pages (/GenZ/...)
export const getAssetUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500';
  
  if (url.startsWith('http://localhost:5000/uploads/')) {
    const filename = url.replace('http://localhost:5000/uploads/', '');
    return `${import.meta.env.BASE_URL}uploads/${filename}`;
  }
  if (url.startsWith('http://localhost:5000/images/')) {
    const filename = url.replace('http://localhost:5000/images/', '');
    return `${import.meta.env.BASE_URL}images/${filename}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${import.meta.env.BASE_URL}${url.slice(1)}`;
  }
  if (url.startsWith('/images/')) {
    return `${import.meta.env.BASE_URL}${url.slice(1)}`;
  }
  return url;
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    _id: 'cat_1',
    name: 'Luxury Gift Hampers',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm.jpeg`,
    subCategories: ['Premium Hampers', 'Gourmet Trays', 'Celebration Baskets']
  },
  {
    _id: 'cat_2',
    name: 'Anniversary',
    image: `${import.meta.env.BASE_URL}uploads/1.jpeg`,
    subCategories: ['Silver Jubilee', 'Golden Jubilee', 'Milestones']
  },
  {
    _id: 'cat_3',
    name: 'Birthday',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm-1.jpeg`,
    subCategories: ['Kids', 'Adults', 'Surprise Combos']
  },
  {
    _id: 'cat_4',
    name: 'Flowers',
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500',
    subCategories: ['Roses', 'Lilies', 'Orchids', 'Vase Arrangements']
  },
  {
    _id: 'cat_5',
    name: 'Chocolate Hampers',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-41-pm.jpeg`,
    subCategories: ['Artisanal Dark', 'Imported Selection', 'Truffle Boxes']
  },
  {
    _id: 'cat_6',
    name: 'Teddy Bears',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-33-pm.jpeg`,
    subCategories: ['Giant Bears', 'Plush Combos', 'Baby Friendly']
  },
  {
    _id: 'cat_7',
    name: 'Customized Gifts',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-54-pm.jpeg`,
    subCategories: ['Photo Frames', 'Engraved Items', 'Mugs & Pillow Combos']
  },
  {
    _id: 'cat_8',
    name: 'Baby Gifts',
    image: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-55-pm.jpeg`,
    subCategories: ['Baby Shower', 'Newborn Essentials', 'Toys']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    _id: 'prod_1',
    name: 'Royal Crimson Luxury Gift Hamper',
    price: 4999,
    offerPrice: 3999,
    description: 'An ultra-premium gold-embossed hamper featuring a plush red teddy bear, artisanal dark chocolates, luxury room spray, a handwritten card, and fresh red roses wrapped in gold mesh ribbon.',
    stock: 25,
    category: 'Luxury Gift Hampers',
    subCategory: 'Premium Hampers',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm-1.jpeg`
    ],
    tags: ['featured', 'best_seller', 'trending'],
    ratingAverage: 5,
    reviews: [
      { userName: 'Aishwarya R.', rating: 5, comment: 'Breathtaking presentation! Loved the gold ribbon.', approved: true }
    ]
  },
  {
    _id: 'prod_2',
    name: 'Golden Jubilee Anniversary Box',
    price: 3499,
    offerPrice: 2999,
    description: 'Elegant white box wrapped in shimmering gold satin ribbon, containing premium single-origin coffee beans, customized gold-rimmed mugs, rich Belgian dark chocolate truffles, and a mini rose bouquet.',
    stock: 15,
    category: 'Anniversary',
    subCategory: 'Golden Jubilee',
    images: [
      `${import.meta.env.BASE_URL}uploads/1.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm-2.jpeg`
    ],
    tags: ['trending', 'featured'],
    ratingAverage: 4.8,
    reviews: [
      { userName: 'Sameer K.', rating: 4.8, comment: 'High quality coffee and beautiful presentation.', approved: true }
    ]
  },
  {
    _id: 'prod_3',
    name: 'Sweet Grace Teddy & Flowers Bouquet',
    price: 1999,
    offerPrice: 1599,
    description: 'A fluffy, premium-grade white teddy bear holding a velvet heart, paired with a gorgeous bunch of fresh lilies and red carnations arranged in designer parchment wrap.',
    stock: 50,
    category: 'Teddy Bears',
    subCategory: 'Plush Combos',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-33-pm.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-33-pm-1.jpeg`
    ],
    tags: ['featured', 'best_seller'],
    ratingAverage: 4.9,
    reviews: []
  },
  {
    _id: 'prod_4',
    name: 'Artisanal Chocolate Symphony Tray',
    price: 1499,
    offerPrice: 1249,
    description: 'A handcrafted dark wood tray filled with gourmet dark chocolate bars, almond dragées, roasted hazelnuts, and double-chocolate fudge cookies, finished with a classic golden ribbon.',
    stock: 40,
    category: 'Chocolate Hampers',
    subCategory: 'Artisanal Dark',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-41-pm.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-41-pm-1.jpeg`
    ],
    tags: ['best_seller'],
    ratingAverage: 4.7,
    reviews: []
  },
  {
    _id: 'prod_5',
    name: 'Enchanted Red Rose Bouquet',
    price: 1199,
    offerPrice: 999,
    description: 'Twelve luxury long-stemmed red roses styled carefully in a premium matte ivory wrap and bound with an elegant gold-embossed ribbon.',
    stock: 30,
    category: 'Flowers',
    subCategory: 'Roses',
    images: [
      'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500'
    ],
    tags: ['trending'],
    ratingAverage: 4.9,
    reviews: []
  },
  {
    _id: 'prod_6',
    name: 'Custom Memoirs Gold Photo & Gift Crate',
    price: 2499,
    offerPrice: 1999,
    description: 'A striking arrangement of custom gift items, golden-tinted accessories, and hand-wrapped hampers.',
    stock: 12,
    category: 'Customized Gifts',
    subCategory: 'Photo Frames',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-54-pm.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-54-pm-1.jpeg`
    ],
    tags: ['featured', 'trending'],
    ratingAverage: 4.8,
    reviews: []
  },
  {
    _id: 'prod_7',
    name: 'Baby Care & Plush Bear Gift Set',
    price: 2799,
    offerPrice: 2399,
    description: 'Soft organic cotton baby blankets, plush teddy, and organic baby skincare products packed in a premium reusable white woven basket with a soft pink/blue ribbon.',
    stock: 20,
    category: 'Baby Gifts',
    subCategory: 'Newborn Essentials',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-55-pm.jpeg`
    ],
    tags: ['best_seller'],
    ratingAverage: 4.9,
    reviews: []
  },
  {
    _id: 'prod_8',
    name: 'Celebration Grand Royal Basket',
    price: 5999,
    offerPrice: 4999,
    description: 'The ultimate luxury hamper with multiple layers of artisanal chocolates, plush toys, custom message cards, and fresh flowers.',
    stock: 10,
    category: 'Luxury Gift Hampers',
    subCategory: 'Celebration Baskets',
    images: [
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-16-15-pm.jpeg`,
      `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-54-pm-2.jpeg`
    ],
    tags: ['featured', 'best_seller'],
    ratingAverage: 5.0,
    reviews: []
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    _id: 'med_1',
    name: 'Royal Anniversary Setup',
    url: `${import.meta.env.BASE_URL}uploads/1.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Anniversary Gifts'
  },
  {
    _id: 'med_2',
    name: 'Luxury Gift Wrap Handover 1',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Customer Deliveries'
  },
  {
    _id: 'med_3',
    name: 'Luxury Gift Wrap Handover 2',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-40-pm-1.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Customer Deliveries'
  },
  {
    _id: 'med_4',
    name: 'Luxury Chocolate Hamper Presentation',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-00-41-pm.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Birthday Gifts'
  },
  {
    _id: 'med_5',
    name: 'Teddy & Floral Bouquet Handover',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-33-pm.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Customer Deliveries'
  },
  {
    _id: 'med_6',
    name: 'Customized Gift Crate Handover',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-image-2026-06-23-at-7-01-54-pm.jpeg`,
    mimetype: 'image/jpeg',
    category: 'Wedding Gifts'
  },
  {
    _id: 'med_7',
    name: 'Happy Customer Celebration Video 1',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-video-2026-06-23-at-7-01-44-pm.mp4`,
    mimetype: 'video/mp4',
    category: 'Customer Deliveries'
  },
  {
    _id: 'med_8',
    name: 'Happy Customer Celebration Video 2',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-video-2026-06-23-at-7-01-48-pm.mp4`,
    mimetype: 'video/mp4',
    category: 'Customer Deliveries'
  },
  {
    _id: 'med_9',
    name: 'Unboxing Celebration Video 3',
    url: `${import.meta.env.BASE_URL}uploads/whatsapp-video-2026-06-23-at-7-01-53-pm.mp4`,
    mimetype: 'video/mp4',
    category: 'Customer Deliveries'
  }
];
