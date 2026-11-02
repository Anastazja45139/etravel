// Expands compact country sources (scripts/content/*.json) into src/data/countries/<iso>.json.
// Hotel tiers/stars/capacity follow a fixed order; car prices derive from the economy price.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const TIERS = [['budget', 2, 2], ['3', 3, 2], ['4', 4, 3], ['boutique', 4, 2], ['5', 5, 4]];
const dir = new URL('./content/', import.meta.url);
const out = new URL('../src/data/countries/', import.meta.url);
const L = ([uk, pl]) => ({ uk, pl });

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  for (const s of JSON.parse(readFileSync(new URL(file, dir), 'utf8'))) {
    const p = s.iso2.toLowerCase();
    const cities = s.cities.map(([id, uk, pl, wiki, lat, lng, bu, bp]) => ({ id: `${p}-${id}`, name: { uk, pl }, wiki, lat, lng, blurb: { uk: bu, pl: bp } }));
    const [eco, suv, prem, price] = s.cars;
    const country = {
      iso2: s.iso2, wiki: s.wiki, capital: L(s.cap), intro: L(s.intro), cities,
      dishes: s.dishes.map(([nu, np, du, dp]) => ({ name: { uk: nu, pl: np }, description: { uk: du, pl: dp } })),
      facts: s.facts.map(L), bestMonths: s.months, dailyCost: s.daily, tags: s.tags,
      airport: { code: s.air[0], name: s.air[1], lat: s.air[2], lng: s.air[3] },
      hotels: s.hotels.map(([name, ci, ppn, tags, du, dp], i) => ({
        id: `${p}-h${i + 1}`, name, cityId: cities[ci].id, tier: TIERS[i][0], stars: TIERS[i][1],
        pricePerNight: ppn, capacity: TIERS[i][2], tags, description: { uk: du, pl: dp },
      })),
      cars: [
        { id: `${p}-c1`, class: 'economy', model: eco, pricePerDay: price, seats: 4 },
        { id: `${p}-c2`, class: 'suv', model: suv, pricePerDay: Math.round(price * 1.8), seats: 5 },
        { id: `${p}-c3`, class: 'premium', model: prem, pricePerDay: Math.round(price * 3.7), seats: 5 },
      ],
    };
    writeFileSync(new URL(`${p}.json`, out), JSON.stringify(country, null, 2) + '\n');
    console.log('wrote', p);
  }
}
