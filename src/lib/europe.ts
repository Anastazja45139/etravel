/**
 * Countries drawn inside the highlighted Europe outline on the globe.
 * Russia and Belarus are excluded (no trips offered); Turkey and the Caucasus count as Asia.
 * Micro-states are outlined but have no guide of their own — they are too small to click.
 */
export const EUROPE = new Set((
  'AD AL AT BA BE BG CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS ' +
  'SE SI SK SM UA VA XK'
).split(' '));

export const isEuropean = (iso2: string): boolean => EUROPE.has(iso2.toUpperCase());

export type Region = 'west' | 'south' | 'central' | 'north' | 'east' | 'balkans';
export const REGIONS: Region[] = ['west', 'south', 'central', 'north', 'east', 'balkans'];
const REGION_OF: Record<Region, string> = {
  west: 'GB IE FR BE NL LU DE CH AT LI AD MC',
  south: 'ES PT IT MT GR CY SM VA',
  central: 'PL CZ SK HU SI',
  north: 'DK SE NO FI IS EE LV LT',
  east: 'UA MD RO BG',
  balkans: 'HR BA RS ME MK AL XK',
};
const regionIndex = new Map(REGIONS.flatMap((r) => REGION_OF[r].split(' ').map((c) => [c, r] as const)));
export const regionOf = (iso2: string): Region | undefined => regionIndex.get(iso2.toUpperCase());
