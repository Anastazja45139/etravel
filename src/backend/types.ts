import type { Tag } from '../data/types';

export interface User { id: string; email: string; name: string }
export type AgeGroup = '18-30' | '31-45' | '46-60' | '60+';
export type HotelClass = 'any' | 'budget' | 'mid' | 'premium';
export interface TripInput {
  departureIso2: string; startDate: string; nights: number; adults: number; children: number;
  ageGroup: AgeGroup; budget: number; prefs: Tag[]; hotelClass: HotelClass; wantsCar: boolean;
  mode: 'one' | 'list' | 'surprise'; countries: string[];
}
export interface TripRequest extends TripInput { id: string; userId: string; createdAt: string }
export interface NewBooking {
  /** Set for bookings made from the trip planner. */
  requestId: string | null;
  /** Set for bookings of a ready-made tour. */
  tourId?: string | null;
  countryIso2: string; hotelId: string; carId: string | null;
  startDate: string; nights: number; travellers: number; total: number;
}
export interface Booking extends NewBooking { id: string; userId: string; status: 'confirmed' | 'cancelled'; paid: boolean; createdAt: string }

/** Demo wallet movement: top-ups are positive, payments negative, refunds positive. */
export interface WalletTx { id: string; type: 'topup' | 'payment' | 'refund'; amount: number; bookingId: string | null; createdAt: string }
export const MAX_TOPUP = 10000;

/** What a review is about. `service` reviews are about ETravel itself and have no country. */
export type ReviewTarget = 'country' | 'city' | 'hotel' | 'car' | 'tour' | 'service';
export interface NewReview { countryIso2: string | null; targetType: ReviewTarget; targetId: string | null; rating: number; text: string }
export interface Review extends NewReview { id: string; author: string; lang: 'uk' | 'pl' | 'en'; createdAt: string; mine?: boolean }

export type BackendErrorCode = 'invalid_credentials' | 'email_taken' | 'email_not_confirmed' | 'not_authenticated' | 'not_found' | 'insufficient_funds' | 'invalid_amount' | 'invalid_review' | 'generic';
export class BackendError extends Error {
  code: BackendErrorCode;
  constructor(code: BackendErrorCode, message?: string) { super(message ?? code); this.code = code; this.name = 'BackendError'; }
}

export interface Backend {
  currentUser(): Promise<User | null>;
  onAuthChange(cb: (u: User | null) => void): () => void;
  signUp(email: string, password: string, name: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  saveRequest(input: TripInput): Promise<TripRequest>;
  listRequests(): Promise<TripRequest[]>;
  getRequest(id: string): Promise<TripRequest | null>;
  createBooking(b: NewBooking): Promise<Booking>;
  listBookings(): Promise<Booking[]>;
  /** Cancels a booking; a paid one is refunded to the wallet. */
  cancelBooking(id: string): Promise<void>;
  /** Reviews for a country (or ETravel service reviews when iso2 is null), newest first. */
  listReviews(countryIso2: string | null): Promise<Review[]>;
  addReview(r: NewReview, lang: Review['lang']): Promise<Review>;
  listFavorites(): Promise<string[]>;
  getBalance(): Promise<number>;
  listTransactions(): Promise<WalletTx[]>;
  /** Demo top-up, 1..MAX_TOPUP EUR; resolves to the new balance. */
  topUp(amount: number): Promise<number>;
  /** Pays a confirmed, unpaid booking from the balance (throws insufficient_funds). */
  payBooking(id: string): Promise<void>;
  /** Adds or removes a country; resolves to whether it is now a favourite. */
  toggleFavorite(iso2: string): Promise<boolean>;
}
