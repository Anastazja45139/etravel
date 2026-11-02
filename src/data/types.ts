export type Lang = 'uk' | 'pl';
export type L10n = { uk: string; pl: string };
export type Tag =
  | 'sea' | 'mountains' | 'city' | 'nature' | 'history'
  | 'food' | 'nightlife' | 'family' | 'couples' | 'comfort';
export type HotelTier = 'budget' | '3' | '4' | 'boutique' | '5';

export interface City { id: string; name: L10n; wiki: string; blurb: L10n; lat: number; lng: number }
export interface Dish { name: L10n; description: L10n }
export interface Hotel {
  id: string; name: string; cityId: string; tier: HotelTier; stars: 1 | 2 | 3 | 4 | 5;
  /** EUR per room per night */
  pricePerNight: number;
  /** guests per room */
  capacity: number;
  tags: Tag[]; description: L10n;
}
export interface Car { id: string; class: 'economy' | 'suv' | 'premium'; model: string; pricePerDay: number; seats: number }
export interface Country {
  iso2: string; wiki: string; capital: L10n; intro: L10n;
  cities: City[]; dishes: Dish[]; facts: L10n[];
  bestMonths: number[];
  /** typical mid-range daily spend per person in EUR, excluding hotel */
  dailyCost: number;
  tags: Tag[];
  airport: { code: string; name: string; lat: number; lng: number };
  hotels: Hotel[]; cars: Car[];
}

export const ALL_TAGS: Tag[] = ['sea', 'mountains', 'city', 'nature', 'history', 'food', 'nightlife', 'family', 'couples', 'comfort'];
export const HOTEL_TIERS: HotelTier[] = ['budget', '3', '4', 'boutique', '5'];
export const CAR_CLASSES: Car['class'][] = ['economy', 'suv', 'premium'];
