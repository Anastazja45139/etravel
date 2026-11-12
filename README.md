# ETravel — Etap 1: Baza danych

Platforma turystyczna po Europie. W tym etapie przygotowaliśmy **bazę danych PostgreSQL (Supabase)**.

- 14 tabel: katalog (kraje, miasta, dania, ciekawostki, hotele, samochody, wycieczki, trasy wycieczek), dane użytkowników (profile, ulubione, zapytania, rezerwacje, portfel) i opinie
- 41 krajów Europy, ~150 miast, 205 hoteli, 123 samochody, 123 gotowe wycieczki — w trzech językach: ukraińskim, polskim i angielskim
- Bezpieczeństwo: Row Level Security — użytkownik widzi tylko swoje dane
- Diagram ERD i opis tabel: [docs/DATABASE.md](docs/DATABASE.md)

```bash
npm install
npm run db:check   # uruchamia schemat i dane na lokalnym PostgreSQL (PGlite) i wypisuje statystyki
```

---

## English

ETravel is a travel platform about European countries. In this stage we built the **PostgreSQL database (Supabase)**.

- 14 tables: catalogue (countries, cities, dishes, facts, hotels, cars, tours, tour routes), user data (profiles, favourites, trip requests, bookings, wallet) and reviews
- 41 European countries, ~150 cities, 205 hotels, 123 cars, 123 ready-made tours — in three languages: Ukrainian, Polish and English
- Security: Row Level Security — each user sees only their own data
- ERD diagram and table descriptions: [docs/DATABASE.md](docs/DATABASE.md)

```bash
npm install
npm run db:check   # loads the schema and data into a local PostgreSQL (PGlite) and prints statistics
```
