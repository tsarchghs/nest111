# Supabase Cloud Setup

1. Install the Supabase CLI.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Link the local project to your cloud project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

4. Push the schema to the linked cloud database:

```bash
supabase db push
```

5. Seed the demo users and role assignments:

```bash
node --env-file=.env scripts/supabase-seed-demo.mjs
```

6. Build and run the app:

```bash
npm run build:full
npm run start:dev
```

Demo logins after seeding:

- `owner@nexus.local` / `Passw0rd!`
- `erp@nexus.local` / `Passw0rd!`
- `admin@nexus.local` / `Passw0rd!`
- `pos@nexus.local` / `Passw0rd!`
