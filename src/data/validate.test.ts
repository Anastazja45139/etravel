import { describe, test, expect } from 'vitest';
import { COUNTRIES } from './countries';
import { validateCountry } from './validate';
import { EUROPE } from '../lib/europe';
import type { Country } from './types';

const MICRO = ['MC', 'SM', 'VA'];
const ALL = [...EUROPE].filter((x) => !MICRO.includes(x));
const clone = (c: Country): Country => JSON.parse(JSON.stringify(c));

describe('country content', () => {
  test('has a guide for every European country except micro-states', () => {
    expect(new Set(COUNTRIES.map((c) => c.iso2))).toEqual(new Set(ALL));
  });

  test.each(ALL)('%s passes validation', (iso) => {
    const c = COUNTRIES.find((x) => x.iso2 === iso)!;
    expect(validateCountry(c)).toEqual([]);
  });

  test('flags a country with only 4 hotels', () => {
    const c = clone(COUNTRIES[0]);
    c.hotels.pop();
    expect(validateCountry(c).join(' ')).toContain('hotels');
  });

  test('flags an empty Polish intro', () => {
    const c = clone(COUNTRIES[0]);
    c.intro.pl = '';
    expect(validateCountry(c).join(' ')).toContain('intro.pl');
  });
});
