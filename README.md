# ETravel — Etap 1: Baza danych

Platforma turystyczna po Europie. W tym etapie przygotowaliśmy **bazę danych PostgreSQL (Supabase)**.

- 12 tabel: katalog (kraje, miasta, dania, ciekawostki, hotele, samochody, wycieczki) i dane użytkowników (profile, ulubione, zapytania, rezerwacje)
- 41 krajów Europy, ~150 miast, 205 hoteli, 123 samochody, 123 gotowe wycieczki — po ukraińsku i po polsku
- Bezpieczeństwo: Row Level Security — użytkownik widzi tylko swoje dane
- Diagram ERD i opis tabel: [docs/DATABASE.md](docs/DATABASE.md)

```bash
npm install
npm run db:check   # uruchamia schemat i dane na lokalnym PostgreSQL (PGlite) i wypisuje statystyki
```
