// Store type definitions for community marketplace

export type StoreType = 'RETAIL' | 'SERVICES' | 'FOOD' | 'RIDERS' | 'EVENTS';

// ============================================
// 1. RETAIL Store - E-commerce/product sales
// ============================================
export interface RetailItem {
  id: number;
  name: string;
  category: string; // e.g., "Electronics", "Sports", "Accessories"
  description: string;
  price: number;
  originalPrice?: number; // for discounts
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  variants?: {
    size?: string[]; // e.g., ["6", "7", "8"]
    color?: string[]; // e.g., ["Black", "White", "Blue"]
  };
  storeId: number;
}

// ============================================
// 2. SERVICES Store - Service bookings
// ============================================
export interface ServiceProvider {
  name: string;
  avatar: string;
  experience: string;
}

export interface ServiceAvailability {
  day: string;
  slots: string[]; // time slots like ["09:00", "10:00"]
}

export interface ServiceItem {
  id: number;
  name: string;
  category: string; // e.g., "Hair & Beauty", "Cleaning", "Home Repair"
  description: string;
  price: number;
  duration: number; // in minutes
  rating: number;
  reviews: number;
  provider: ServiceProvider;
  availability: ServiceAvailability[];
  storeId: number;
}

// ============================================
// 3. FOOD Store - Restaurant/food ordering
// ============================================
export interface FoodItem {
  id: number;
  name: string;
  category: string; // e.g., "Filipino", "Desserts", "Pasta", "Beverages"
  description: string;
  price: number;
  prepTime: number; // in minutes
  rating: number;
  reviews: number;
  image: string;
  tags: string[]; // e.g., ["bestseller", "spicy"]
  storeId: number;
}

// ============================================
// 4. RIDERS Store - Transportation/delivery
// ============================================
export interface RiderOption {
  id: number;
  name: string;
  category: string; // e.g., "Budget", "Comfort", "Delivery", "Fast"
  pricePerKm: number;
  basePrice: number;
  rating: number;
  availableRiders: number;
  estimatedTime: number; // in minutes
  features: string[]; // e.g., ["Air conditioned", "Licensed driver"]
  storeId: number;
}

// ============================================
// 5. EVENTS Store - Event ticketing
// ============================================
export interface EventItem {
  id: number;
  name: string;
  category: string; // e.g., "Food & Drinks", "Sports", "Entertainment", "Education"
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  ticketPrice: number;
  availableTickets: number;
  image: string;
  tags: string[]; // e.g., ["live", "food", "family-friendly"]
  storeId: number;
}

// Union type for all store items
export type StoreItem = RetailItem | ServiceItem | FoodItem | RiderOption | EventItem;
