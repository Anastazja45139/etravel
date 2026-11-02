import { ALL_TAGS, CAR_CLASSES, HOTEL_TIERS, type Country, type L10n } from './types';

const between = (n: number, min: number, max: number) => n >= min && n <= max;

/** Returns a list of problems with a country's content; empty means valid. */
export function validateCountry(c: Country): string[] {
  const errs: string[] = [];
  const l10n = (v: L10n | undefined, path: string) => {
    if (!v?.uk?.trim()) errs.push(`${path}.uk is empty`);
    if (!v?.pl?.trim()) errs.push(`${path}.pl is empty`);
  };
  const tags = (t: string[], path: string) => t.forEach((x) => { if (!ALL_TAGS.includes(x as never)) errs.push(`${path}: unknown tag ${x}`); });

  if (!/^[A-Z]{2}$/.test(c.iso2)) errs.push('iso2 must be two uppercase letters');
  if (!c.wiki?.trim()) errs.push('wiki is empty');
  l10n(c.capital, 'capital');
  l10n(c.intro, 'intro');
  if (!between(c.cities.length, 3, 5)) errs.push(`cities: expected 3-5, got ${c.cities.length}`);
  if (!between(c.dishes.length, 3, 5)) errs.push(`dishes: expected 3-5, got ${c.dishes.length}`);
  if (!between(c.facts.length, 3, 5)) errs.push(`facts: expected 3-5, got ${c.facts.length}`);
  c.cities.forEach((x, i) => { l10n(x.name, `cities[${i}].name`); l10n(x.blurb, `cities[${i}].blurb`); if (!x.wiki) errs.push(`cities[${i}].wiki is empty`); });
  c.dishes.forEach((x, i) => { l10n(x.name, `dishes[${i}].name`); l10n(x.description, `dishes[${i}].description`); });
  c.facts.forEach((x, i) => l10n(x, `facts[${i}]`));
  if (!c.bestMonths.length || c.bestMonths.some((m) => !Number.isInteger(m) || !between(m, 1, 12))) errs.push('bestMonths must be 1-12');
  if (!(c.dailyCost > 0)) errs.push('dailyCost must be positive');
  tags(c.tags, 'tags');
  if (!/^[A-Z]{3}$/.test(c.airport?.code ?? '')) errs.push('airport.code must be IATA');

  if (c.hotels.length !== 5) errs.push(`hotels: expected 5, got ${c.hotels.length}`);
  const tiers = new Set(c.hotels.map((h) => h.tier));
  HOTEL_TIERS.forEach((t) => { if (!tiers.has(t)) errs.push(`hotels: missing tier ${t}`); });
  const cityIds = new Set(c.cities.map((x) => x.id));
  c.hotels.forEach((h, i) => {
    if (!cityIds.has(h.cityId)) errs.push(`hotels[${i}].cityId ${h.cityId} not in cities`);
    if (!(h.pricePerNight > 0)) errs.push(`hotels[${i}].pricePerNight must be positive`);
    if (!between(h.capacity, 1, 6)) errs.push(`hotels[${i}].capacity must be 1-6`);
    if (!h.name?.trim()) errs.push(`hotels[${i}].name is empty`);
    l10n(h.description, `hotels[${i}].description`);
    tags(h.tags, `hotels[${i}].tags`);
  });

  if (c.cars.length !== 3) errs.push(`cars: expected 3, got ${c.cars.length}`);
  const classes = new Set(c.cars.map((x) => x.class));
  CAR_CLASSES.forEach((k) => { if (!classes.has(k)) errs.push(`cars: missing class ${k}`); });
  c.cars.forEach((x, i) => { if (!(x.pricePerDay > 0)) errs.push(`cars[${i}].pricePerDay must be positive`); if (!(x.seats > 0)) errs.push(`cars[${i}].seats must be positive`); });

  const ids = [...c.cities.map((x) => x.id), ...c.hotels.map((x) => x.id), ...c.cars.map((x) => x.id)];
  if (new Set(ids).size !== ids.length) errs.push('ids must be unique');
  return errs;
}
