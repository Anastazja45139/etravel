// Loads schema.sql + seed.sql into an in-memory PostgreSQL (PGlite) with a stub of Supabase's auth schema,
// then prints row counts and a sample query. Proves the SQL runs before it goes to Supabase.
// Run: npm run db:check
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const read = (f: string) => readFileSync(new URL(`../supabase/${f}`, import.meta.url), 'utf8');
const db = new PGlite();
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
`);
await db.exec(read('schema.sql'));
await db.exec(read('seed.sql'));
await db.exec(read('seed.sql')); // must be re-runnable

const tables = ['countries', 'cities', 'dishes', 'facts', 'hotels', 'cars', 'tours', 'tour_cities', 'reviews'];
for (const t of tables) {
  const { rows } = await db.query<{ n: number }>(`select count(*)::int as n from public.${t}`);
  console.log(t.padEnd(12), rows[0].n);
}

// The signup trigger creates a profile.
const { rows: [user] } = await db.query<{ id: string }>(`insert into auth.users (raw_user_meta_data) values ('{"name":"Test"}') returning id`);
const { rows: [profile] } = await db.query<{ name: string }>(`select name from public.profiles where id = $1`, [user.id]);
console.log('trigger profile:', profile.name);

// Wallet: top up, book, pay, refuse overspend, cancel → refund.
await db.query(`select set_config('app.uid', $1, false)`, [user.id]);
await db.query(`select public.wallet_top_up(500)`);
const { rows: [bk] } = await db.query<{ id: string }>(
  `insert into public.bookings (country_iso2, hotel_id, start_date, nights, travellers, total) values ('HR', 'hr-h1', '2027-06-01', 3, 2, 300) returning id`);
await db.query(`select public.pay_booking($1)`, [bk.id]);
const bal = async () => Number((await db.query<{ b: string }>(`select public.wallet_balance() as b`)).rows[0].b);
console.log('balance after paying 300 of 500:', await bal());
const { rows: [bk2] } = await db.query<{ id: string }>(
  `insert into public.bookings (country_iso2, hotel_id, start_date, nights, travellers, total) values ('HR', 'hr-h1', '2027-07-01', 3, 2, 900) returning id`);
const overspend = await db.query(`select public.pay_booking($1)`, [bk2.id]).then(() => 'paid?!', (e: Error) => e.message);
console.log('paying 900 with 200 left:', overspend);
await db.query(`select public.cancel_booking($1)`, [bk.id]);
console.log('balance after cancelling the paid booking:', await bal());
await db.query(`select public.cancel_booking($1)`, [bk.id]);
console.log('second cancel does not refund twice:', await bal());

const { rows } = await db.query(`select iso2, cheapest_night, tours from public.country_overview order by cheapest_night limit 3`);
console.log('cheapest countries:', rows);
