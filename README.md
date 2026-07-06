# Prospecting Online

Webowe MVP aplikacji operatora prospectingu Media Energetyczne. To przepisanie
lokalnej wersji Electron + SQLite na aplikację działającą w chmurze:

- Next.js App Router
- Supabase/Postgres
- Vercel

Logika domenowa zostaje taka sama: firma -> osoby -> kampania -> decyzja
operatora -> historia w `events`.

## Lokalnie

```bash
npm install
copy .env.example .env.local
npm run dev
```

W `.env.local` ustaw:

```bash
SUPABASE_URL=https://hvaipnwpttaepvslxlrl.supabase.co
SUPABASE_SECRET_KEY=sb_secret_or_service_role_key_used_only_on_the_server
```

`SUPABASE_SECRET_KEY` jest używany wyłącznie w route handlerach Next.js. Nie
dodawaj go jako `NEXT_PUBLIC_*`.

## Supabase

Uwaga: projekt `https://hvaipnwpttaepvslxlrl.supabase.co` był wcześniej używany
do czegoś innego. Przed uruchomieniem migracji sprawdź istniejące tabele i dane.
Nie aplikuj SQL automatycznie bez osobnej decyzji.

1. Uruchom SQL z `supabase/migrations/001_initial_schema.sql`.
2. Uruchom demo seed z `supabase/seed.sql`.
3. Ustaw `SUPABASE_URL` i `SUPABASE_SECRET_KEY` w Vercel.

## Vercel

Repo można deployować bezpośrednio z roota. Build command:

```bash
npm run build
```
