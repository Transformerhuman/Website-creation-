import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name_en: "Hybrid Tomato Seeds",
    name_ne: "हाइब्रिड टमाटरको बीउ",
    desc_en: "High yield hybrid tomato seeds for winter season.",
    desc_ne: "हिउँदको मौसमका लागि उच्च उत्पादन दिने हाइब्रिड टमाटरको बीउ।",
    price: 450,
    category: "seeds",
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80",
    seller: "Nepal Agri Seed Co."
  },
  {
    id: 2,
    name_en: "Organic Fertilizer",
    name_ne: "जैविक मल",
    desc_en: "100% organic compost for all crops.",
    desc_ne: "सबै बालीका लागि १००% जैविक कम्पोस्ट।",
    price: 120,
    category: "fertilizer",
    imageUrl: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=400&q=80",
    seller: "Green Earth Fertilizers"
  }
];

export const LIVE_STREAMS = [
  { id: '1', title: 'Winter Wheat Strategy', expert: 'Dr. Sharma', startTime: '10:00 AM' }
];

export const GOV_SCHEMES = [
  { id: 's1', title_en: 'Seed Subsidy', title_ne: 'बीउ अनुदान', desc_en: '...', desc_ne: '...' }
];

export const MARKET_PRICES = [
  { commodity: 'Tomato', commodityNe: 'टमाटर', avgPrice: 85, trend: 'up' },
  { commodity: 'Potato', commodityNe: 'आलु', avgPrice: 40, trend: 'stable' }
];
