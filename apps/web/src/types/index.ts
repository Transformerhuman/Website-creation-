export type View = 'news' | 'news-detail' | 'shop' | 'partners' | 'corporate' | 'admin' | 'expert-live' | 'helpline' | 'schemes' | 'about' | 'contact';

export interface NewsItem {
  _id?: string;
  id?: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface User {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface Product {
  id?: number;
  _id?: string;
  name_en: string;
  name_ne: string;
  desc_en: string;
  desc_ne: string;
  price: number;
  category: string;
  imageUrl: string;
  seller: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BulkListing extends Product {
  minOrder: number;
  totalStock: number;
  location_en: string;
  location_ne: string;
}

export interface BuyerNeed {
  id?: number;
  _id?: string;
  item: string;
  quantity: string;
  buyerName: string;
  location: string;
}

export interface PartnerFarm extends Product {
  farmName: string;
  ownerName: string;
  status: 'pending' | 'approved';
  contactPhone: string;
}

export interface CorporateEnrollment {
  id?: number;
  _id?: string;
  fullName: string;
  farmLocation: string;
  phone: string;
  status: 'pending' | 'approved';
}

export interface AboutUsContent {
  [key: string]: any;
}

export interface CorporateContent {
  title: string;
  benefits: string[];
}

export interface StreamSession {
  id: string;
  title: string;
  expert: string;
  startTime: string;
}

export interface GovScheme {
  id: string;
  title_en: string;
  title_ne: string;
  desc_en: string;
  desc_ne: string;
}

export interface ApplicationSubmission {
  id?: string;
  schemeId: string;
  userId: string;
}

export interface HelplineRequest {
  id?: string;
  userId: string;
  query: string;
}

export interface MarketPrice {
  commodity: string;
  commodityNe: string;
  avgPrice: number;
  trend?: 'up' | 'down' | 'stable';
}
