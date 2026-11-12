import type { Country } from '../data/types';
import type { Review, ReviewTarget } from '../backend/types';
import { toursFor } from './tours';

/**
 * Starter reviews so every country page has feedback from day one. Deterministic (seeded by the country
 * code), written in the reviewer's own language like on real booking sites. Shown as sample reviews.
 */
type Lang = Review['lang'];
interface Vars { country: string; city: string; hotel: string; car: string; tour: string; dish: string }

const AUTHORS: Record<Lang, string[]> = {
  uk: ['Олена К.', 'Андрій М.', 'Ірина та Сергій', 'Марта Л.', 'Дмитро П.', 'Катерина В.', 'Тарас Г.', 'Юлія С.', 'Олександр Б.', 'Наталя Ф.', 'Максим Р.', 'Софія Д.'],
  pl: ['Anna W.', 'Piotr K.', 'Magda i Tomek', 'Kasia Z.', 'Marek N.', 'Agnieszka P.', 'Bartek S.', 'Ola M.', 'Jakub L.', 'Ewa D.'],
  en: ['Emily R.', 'James T.', 'Sophie & Ben', 'Liam O.', 'Hannah K.', 'Daniel W.'],
};

const T: Record<Exclude<ReviewTarget, 'service'>, Record<Lang, ((v: Vars) => string)[]>> = {
  country: {
    uk: [
      (v) => `${v.country} перевершила всі очікування. Люди привітні, все легко знайти, а ${v.dish} я досі згадую. Повернемося обов'язково!`,
      (v) => `Їхали вперше й трохи хвилювалися, але путівник ETravel дуже допоміг. ${v.country} — ідеальна для тижня відпочинку.`,
      () => `Чудова країна для подорожі з друзями. Ціни приємні, транспорт зручний. Єдине — влітку буває дуже людно.`,
    ],
    pl: [
      (v) => `${v.country} to był strzał w dziesiątkę. Piękne widoki, życzliwi ludzie, a ${v.dish} — palce lizać!`,
      () => `Pierwszy raz w tym kraju i na pewno nie ostatni. Wszystko zgodnie z opisem w przewodniku.`,
    ],
    en: [
      (v) => `${v.country} was even better than the photos. Friendly people, easy to get around, and the ${v.dish} was unforgettable.`,
    ],
  },
  city: {
    uk: [
      (v) => `${v.city} — любов з першого погляду. Гуляли до ночі, кожна вулиця як листівка.`,
      (v) => `Провели в місті ${v.city} три дні, і цього замало. Обов'язково беріть зручне взуття!`,
      (v) => `${v.city} дуже атмосферне, особливо зранку, поки немає туристів. Рекомендую піднятися на оглядовий майданчик.`,
    ],
    pl: [
      (v) => `${v.city} zachwyca o każdej porze dnia. Najlepiej zwiedzać pieszo, bez pośpiechu.`,
      (v) => `Spędziliśmy w ${v.city} weekend — za mało! Świetne jedzenie i klimat.`,
    ],
    en: [(v) => `${v.city} is charming — we walked everywhere and found a great café on every corner.`],
  },
  hotel: {
    uk: [
      (v) => `Зупинялися в ${v.hotel}. Чисто, тихо, персонал усміхнений, сніданок смачний. Співвідношення ціна/якість — відмінне.`,
      (v) => `${v.hotel} — саме те, що треба після довгого дня. Зручне ліжко й чудове розташування.`,
    ],
    pl: [(v) => `${v.hotel}: czysto, wygodnie i blisko centrum. Obsługa bardzo pomocna.`],
    en: [(v) => `${v.hotel} was spotless and the staff went out of their way to help us. Great location too.`],
  },
  car: {
    uk: [
      (v) => `Брали ${v.car} на тиждень — машина нова, видали швидко, без прихованих платежів. Об'їхали все узбережжя.`,
      (v) => `${v.car} економна й зручна, на трасі тримає дорогу чудово. Оформлення через ETravel зайняло 5 хвилин.`,
    ],
    pl: [(v) => `Wypożyczyliśmy ${v.car} — auto w świetnym stanie, odbiór bez kolejki. Polecam na zwiedzanie okolicy.`],
    en: [(v) => `Rented the ${v.car} — clean, economical and easy pick-up. Perfect for day trips.`],
  },
  tour: {
    uk: [
      (v) => `Брали тур «${v.tour}» і не пошкодували: маршрут продуманий, готель класний, нічого не треба було організовувати самим.`,
      (v) => `«${v.tour}» — найкращий подарунок собі за рік. Все за планом, а ціна така, як на сайті.`,
    ],
    pl: [(v) => `Wycieczka „${v.tour}” — świetnie zaplanowana trasa i hotel. Zero stresu, sam odpoczynek.`],
    en: [(v) => `We booked "${v.tour}" and it was effortless — the route and the hotel were spot on.`],
  },
};

const SERVICE: Record<Lang, string[]> = {
  uk: [
    'Найзручніший сервіс для планування, яким я користувалася. Глобус — це просто вау, а підбір під бюджет реально працює.',
    'Сподобалося, що одразу видно повну ціну: переліт, готель, машина. Ніяких сюрпризів.',
    'Поповнила гаманець і оплатила тур за хвилину. Все зрозуміло навіть мамі 🙂',
    'Красивий і швидкий сайт. Хотілося б ще більше міст, але й так дуже круто.',
  ],
  pl: [
    'Bardzo wygodny serwis — dobór podróży pod budżet działa świetnie, a globus robi wrażenie.',
    'Wszystko po polsku, jasne ceny i szybka rezerwacja. Polecam!',
  ],
  en: ['Beautiful site and genuinely useful trip planner. Booking took less than a minute.'],
};

/** Small deterministic PRNG so the same country always gets the same reviews. */
function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const pick = <X,>(r: () => number, a: X[]) => a[Math.floor(r() * a.length)];
const daysAgo = (n: number) => new Date(Date.UTC(2026, 9, 28) - n * 864e5).toISOString();

const LANGS: Lang[] = ['uk', 'uk', 'uk', 'pl', 'pl', 'en'];

export function seedReviews(c: Country, names: Record<Lang, string>): Review[] {
  const r = rng(c.iso2);
  const tours = toursFor(c);
  // Each language's author list is shuffled per country and consumed in order, so nobody reviews twice.
  const queue = Object.fromEntries((Object.keys(AUTHORS) as Lang[]).map((l) => [l, [...AUTHORS[l]].sort(() => r() - 0.5)])) as Record<Lang, string[]>;
  const lower = (x: string) => x.charAt(0).toLowerCase() + x.slice(1);
  const plan: { type: Exclude<ReviewTarget, 'service'>; id: string | null; vars: Partial<Vars> }[] = [
    { type: 'country', id: null, vars: {} },
    { type: 'city', id: c.cities[0].id, vars: { city: c.cities[0].name.uk } },
    { type: 'city', id: c.cities[1].id, vars: { city: c.cities[1].name.uk } },
    { type: 'hotel', id: c.hotels[2].id, vars: { hotel: c.hotels[2].name } },
    { type: 'hotel', id: c.hotels[3].id, vars: { hotel: c.hotels[3].name } },
    { type: 'car', id: c.cars[0].id, vars: { car: c.cars[0].model } },
    { type: 'tour', id: tours[0].id, vars: { tour: tours[0].title.uk } },
  ];
  return plan.map((p, i) => {
    const lang = pick(r, LANGS);
    const city = p.type === 'city' ? c.cities.find((x) => x.id === p.id)! : c.cities[0];
    const vars: Vars = {
      country: names[lang], city: city.name[lang], hotel: c.hotels[2].name, car: c.cars[0].model,
      tour: tours[0].title[lang], dish: lower(c.dishes[0].name[lang]),
      ...(p.type === 'hotel' ? { hotel: p.vars.hotel } : {}),
    };
    const rating = r() < 0.72 ? 5 : r() < 0.85 ? 4 : 3;
    return {
      id: `seed-${c.iso2}-${i}`, author: queue[lang].shift() ?? pick(r, AUTHORS[lang]), lang, countryIso2: c.iso2, targetType: p.type, targetId: p.id,
      rating, text: pick(r, T[p.type][lang])(vars), createdAt: daysAgo(3 + Math.floor(r() * 300)),
    };
  });
}

export function seedServiceReviews(): Review[] {
  const r = rng('service');
  return (['uk', 'uk', 'pl', 'uk', 'en', 'pl', 'uk'] as Lang[]).map((lang, i) => ({
    id: `seed-service-${i}`, author: pick(r, AUTHORS[lang]), lang, countryIso2: null, targetType: 'service' as const, targetId: null,
    rating: i % 4 === 3 ? 4 : 5, text: SERVICE[lang][i % SERVICE[lang].length], createdAt: daysAgo(2 + i * 17),
  }));
}
