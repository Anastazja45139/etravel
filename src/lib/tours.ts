import type { City, Country, Hotel, HotelTier, L10n, Tag } from '../data/types';

/** A ready-made package: a themed route through a country with one hotel, priced per person. */
export interface Tour {
  id: string;
  countryIso2: string;
  theme: TourTheme;
  title: L10n;
  nights: number;
  route: City[];
  hotel: Hotel;
  /** Hotel (shared double room) + daily spend, per person, flights excluded. */
  pricePerPerson: number;
}

export type TourTheme = 'sea' | 'mountains' | 'city' | 'food' | 'romance' | 'family' | 'luxury';

interface ThemeDef { tag: Tag; nights: number; tiers: HotelTier[]; title: L10n }

const THEMES: Record<TourTheme, ThemeDef> = {
  sea: { tag: 'sea', nights: 7, tiers: ['4', '3', 'boutique'], title: { uk: 'Тиждень біля моря', pl: 'Tydzień nad morzem', en: 'A week by the sea' } },
  mountains: { tag: 'mountains', nights: 6, tiers: ['4', '3', 'boutique'], title: { uk: 'Гори та свіже повітря', pl: 'Góry i świeże powietrze', en: 'Mountains and fresh air' } },
  city: { tag: 'city', nights: 4, tiers: ['3', '4', 'budget'], title: { uk: 'Міські канікули', pl: 'Miejskie wakacje', en: 'City break' } },
  food: { tag: 'food', nights: 5, tiers: ['boutique', '4', '3'], title: { uk: 'Гастрономічна подорож', pl: 'Podróż kulinarna', en: 'A food journey' } },
  romance: { tag: 'couples', nights: 4, tiers: ['boutique', '5', '4'], title: { uk: 'Романтика для двох', pl: 'Romantycznie we dwoje', en: 'Romance for two' } },
  family: { tag: 'family', nights: 7, tiers: ['4', '3', '5'], title: { uk: 'Сімейні канікули', pl: 'Rodzinne wakacje', en: 'Family holiday' } },
  luxury: { tag: 'comfort', nights: 5, tiers: ['5', 'boutique', '4'], title: { uk: 'Відпочинок класу люкс', pl: 'Wypoczynek w luksusie', en: 'Luxury escape' } },
};

/** Themes are tried in this order; a country gets the first three it suits. */
const ORDER: TourTheme[] = ['sea', 'mountains', 'romance', 'family', 'food', 'city', 'luxury'];
export const TOURS_PER_COUNTRY = 3;

function pickHotel(c: Country, def: ThemeDef, used: Set<string>): Hotel {
  const free = c.hotels.filter((h) => !used.has(h.id));
  const pool = free.length ? free : c.hotels;
  const score = (h: Hotel) => (h.tags.includes(def.tag) ? 10 : 0) + Math.max(0, 3 - def.tiers.indexOf(h.tier)) * (def.tiers.includes(h.tier) ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a) || a.pricePerNight - b.pricePerNight)[0];
}

/** Deterministic: the same country always yields the same tours, so ids are stable across builds and the DB seed. */
export function toursFor(c: Country): Tour[] {
  const themes = ORDER.filter((t) => c.tags.includes(THEMES[t].tag));
  for (const fallback of ['city', 'luxury', 'romance'] as TourTheme[]) if (!themes.includes(fallback)) themes.push(fallback);
  const used = new Set<string>();
  return themes.slice(0, TOURS_PER_COUNTRY).map((theme) => {
    const def = THEMES[theme];
    const hotel = pickHotel(c, def, used);
    used.add(hotel.id);
    const base = c.cities.find((x) => x.id === hotel.cityId)!;
    const route = [base, ...c.cities.filter((x) => x.id !== base.id).slice(0, def.nights >= 6 ? 2 : 1)];
    const perPerson = (hotel.pricePerNight * def.nights) / Math.min(2, hotel.capacity) + c.dailyCost * def.nights;
    return {
      id: `${c.iso2.toLowerCase()}-${theme}`,
      countryIso2: c.iso2,
      theme,
      title: def.title,
      nights: def.nights,
      route,
      hotel,
      pricePerPerson: Math.round(perPerson / 10) * 10,
    };
  });
}
