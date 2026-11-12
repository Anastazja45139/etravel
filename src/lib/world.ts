import type { Lang } from '../data/types';
import { byIso } from '../data/countries';

/** UN member states plus Vatican, Palestine, Kosovo and Taiwan (ISO 3166-1 alpha-2). */
export const ALL_ISO2: string[] = (
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ ' +
  'DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG ' +
  'LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT ' +
  'QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ ' +
  'VU VE VN YE ZM ZW VA PS XK TW'
).split(' ');

const displayNames = new Map<string, Intl.DisplayNames>();
const dn = (lang: string) => {
  let d = displayNames.get(lang);
  if (!d) { d = new Intl.DisplayNames([lang], { type: 'region' }); displayNames.set(lang, d); }
  return d;
};

const OVERRIDES: Record<string, Record<string, string>> = {
  XK: { uk: 'Косово', pl: 'Kosowo', en: 'Kosovo' },
};

export function countryName(iso2: string, lang: Lang | 'en'): string {
  const code = iso2.toUpperCase();
  return OVERRIDES[code]?.[lang] ?? dn(lang).of(code) ?? code;
}

export const hasContent = (iso2: string): boolean => byIso(iso2) !== undefined;
