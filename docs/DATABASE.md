# Baza danych ETravel

**PostgreSQL w chmurze Supabase.** Schemat: [`supabase/schema.sql`](../supabase/schema.sql), dane: [`supabase/seed.sql`](../supabase/seed.sql).

Baza składa się z dwóch części:

- **Katalog (publiczny, tylko do odczytu).** 8 tabel: kraje Europy i wszystko, co do nich należy.
- **Dane użytkowników (prywatne).** 5 tabel: profile, ulubione, zapytania, rezerwacje i portfel (operacje demo).
- **Opinie (publiczne).** Tabela `reviews`: każdy może czytać, zalogowany użytkownik dodaje własne. Chroni je Row Level Security: każdy widzi tylko swoje wiersze.

## Diagram ERD

```mermaid
erDiagram
    countries ||--o{ cities : "ma"
    countries ||--o{ dishes : "ma"
    countries ||--o{ facts : "ma"
    countries ||--o{ hotels : "ma"
    countries ||--o{ cars : "ma"
    countries ||--o{ tours : "ma"
    cities ||--o{ hotels : "leży w"
    hotels ||--o{ tours : "nocleg"
    tours ||--o{ tour_cities : "trasa"
    cities ||--o{ tour_cities : "przystanek"

    users ||--|| profiles : "ma"
    users ||--o{ favorites : "lubi"
    users ||--o{ trip_requests : "tworzy"
    users ||--o{ bookings : "rezerwuje"
    countries ||--o{ favorites : ""
    trip_requests ||--o{ bookings : "z planera"
    tours ||--o{ bookings : "gotowa wycieczka"
    hotels ||--o{ bookings : ""
    cars ||--o{ bookings : "opcjonalnie"
    users ||--o{ wallet_transactions : "portfel"
    users ||--o{ reviews : "pisze"
    countries ||--o{ reviews : "dotyczy"
    bookings ||--o{ wallet_transactions : "płatność / zwrot"

    countries {
        char2 iso2 PK
        text region
        text capital_uk
        text capital_pl
        text intro_uk
        text intro_pl
        smallint_arr best_months
        numeric daily_cost
        text_arr tags
        char3 airport_code
    }
    cities {
        text id PK
        char2 country_iso2 FK
        text name_uk
        text name_pl
        float lat
        float lng
    }
    dishes {
        serial id PK
        char2 country_iso2 FK
        text name_uk
        text name_pl
    }
    facts {
        serial id PK
        char2 country_iso2 FK
        text text_uk
        text text_pl
    }
    hotels {
        text id PK
        char2 country_iso2 FK
        text city_id FK
        text name
        text tier
        smallint stars
        numeric price_per_night
        smallint capacity
    }
    cars {
        text id PK
        char2 country_iso2 FK
        text class
        text model
        numeric price_per_day
        smallint seats
    }
    tours {
        text id PK
        char2 country_iso2 FK
        text hotel_id FK
        text theme
        text title_uk
        text title_pl
        smallint nights
        numeric price_per_person
    }
    tour_cities {
        text tour_id PK,FK
        smallint position PK
        text city_id FK
    }
    users {
        uuid id PK
        text email
    }
    profiles {
        uuid id PK,FK
        text name
    }
    favorites {
        uuid user_id PK,FK
        char2 country_iso2 PK,FK
    }
    trip_requests {
        uuid id PK
        uuid user_id FK
        jsonb input
    }
    bookings {
        uuid id PK
        uuid user_id FK
        uuid request_id FK
        text tour_id FK
        text hotel_id FK
        text car_id FK
        date start_date
        int nights
        int travellers
        numeric total
        text status
        bool paid
    }
    wallet_transactions {
        uuid id PK
        uuid user_id FK
        text type
        numeric amount
        uuid booking_id FK
    }
```

## Tabele

| Tabela | Co przechowuje | Wierszy |
|---|---|---|
| `countries` | 41 krajów Europy: region, stolica, opis (UA/PL/EN), najlepsze miesiące, dzienny koszt, tagi, lotnisko | 41 |
| `cities` | Miasta warte odwiedzenia ze współrzędnymi i opisem | 154 |
| `dishes` | Narodowe dania | 125 |
| `facts` | Ciekawostki o kraju | 124 |
| `hotels` | Po 5 hoteli na kraj, każdy innej klasy (budżetowy, 3★, 4★, butikowy, 5★), z ceną za noc | 205 |
| `cars` | Po 3 samochody na kraj (ekonomiczny, SUV, premium) z ceną za dzień | 123 |
| `tours` | Po 3 gotowe wycieczki na kraj (morze, góry, romantycznie, rodzinnie…) | 123 |
| `tour_cities` | Trasa wycieczki: kolejne miasta (relacja wiele-do-wielu) | 296 |
| `auth.users` | Konta: e-mail i hasło (zahaszowane przez Supabase Auth) | — |
| `profiles` | Imię użytkownika; wiersz tworzy automatycznie trigger `handle_new_user` | — |
| `favorites` | Ulubione kraje użytkownika | — |
| `trip_requests` | Zapytania z planera podróży (budżet, daty, preferencje) w kolumnie `jsonb` | — |
| `bookings` | Rezerwacje: hotel, opcjonalnie samochód, daty, liczba osób, kwota, status, czy opłacona | — |
| `reviews` | Opinie z oceną 1–5 o kraju, mieście, hotelu, samochodzie, wycieczce lub o serwisie ETravel | 294 |
| `wallet_transactions` | Portfel demo: doładowania (+), płatności (−) i zwroty (+); saldo = suma operacji | — |

## Integralność i bezpieczeństwo

- **Klucze obce** z `on delete cascade`. Usunięcie kraju usuwa jego miasta, hotele i wycieczki.
- **Ograniczenia `check`.** Na przykład `nights between 1 and 30`, `price_per_night > 0`, `status in ('confirmed','cancelled')`, kod kraju `^[A-Z]{2}$`.
- **Row Level Security.**
  - Katalog: polityka `public read` (każdy może czytać, nikt nie zapisuje przez API).
  - Dane użytkownika: `user_id = auth.uid()`, czyli wyłącznie właściciel.
- **Funkcje portfela** (`security definer`): `wallet_top_up`, `pay_booking`, `cancel_booking`, `wallet_balance`. Tylko one zmieniają saldo. `pay_booking` blokuje wiersz (`for update`) i sprawdza saldo, więc nie da się zapłacić dwa razy ani zejść poniżej zera. Anulowanie opłaconej rezerwacji zwraca pieniądze.
- **Trigger.** Po rejestracji w `auth.users` od razu powstaje wiersz w `profiles`.
- **Indeksy** po `country_iso2` i `(user_id, created_at)` przyspieszają typowe zapytania.
- **Widok `country_overview`.** Najtańszy nocleg i liczba wycieczek dla każdego kraju.

## Przykładowe zapytania

```sql
-- Najtańsze kraje na wakacje nad morzem
select c.iso2, c.capital_pl, min(h.price_per_night) as od_eur
from countries c join hotels h on h.country_iso2 = c.iso2
where 'sea' = any(c.tags)
group by c.iso2, c.capital_pl order by od_eur limit 5;

-- Trasa gotowej wycieczki
select t.title_pl, tc.position, ci.name_pl
from tours t join tour_cities tc on tc.tour_id = t.id join cities ci on ci.id = tc.city_id
where t.id = 'hr-sea' order by tc.position;
```

## Uruchomienie

1. **Lokalnie, bez konta.** `npm install && npm run db:check` wczytuje schemat i dane do PostgreSQL w pamięci (PGlite) i wypisuje statystyki.
2. **Supabase.** W *SQL Editor* uruchom kolejno `supabase/schema.sql` i `supabase/seed.sql`.
3. **Aktualizacja danych.** Treści krajów leżą w `src/data/countries/*.json`. Komenda `npm run db:seed` generuje z nich nowy `seed.sql`, więc strona i baza mają jedno źródło prawdy.
