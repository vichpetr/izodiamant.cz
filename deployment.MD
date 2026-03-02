# Deployment Guide: Cloudflare Pages

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz na platformu Cloudflare Pages pomocí adaptéru `next-on-pages`.

## 1. Příprava
- Projekt musí být nahrán v Git repozitáři (GitHub, GitLab).
- Musíte mít přístup k účtu na Cloudflare.

## 2. Vytvoření Pages Projektu
1. V Cloudflare dashboardu jdi na **Workers & Pages**.
2. Klikni na **Create application** -> **Pages** -> **Connect to Git**.
3. Vyber repozitář s tímto projektem.
4. **Build settings:**
   - **Framework preset:** `None`
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`

## 3. Nastavení Environmentálních proměnných
V nastavení Pages projektu (**Settings** -> **Environment variables**) přidejte:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_REVIEWS_API_URL`
- `NEXT_PUBLIC_FIRMY_PROFILE_URL`
- **NODE_VERSION:** `20`

## 4. Nastavení Kompatibility (KRITICKÉ)
Aby Next.js na Cloudflare fungoval, musíte povolit Node.js kompatibilitu:
1. Jdi do **Settings** -> **Functions**.
2. V sekci **Compatibility flags** přidejte pro Production i Preview příznak:
   - `nodejs_compat`

## 5. Nastavení Cloudflare Workeru (Pro živé recenze)
1. **Workers & Pages** -> **Create application** -> **Create Worker**.
2. Použijte kód z README.md.
3. URL nasazeného Workeru vložte do `NEXT_PUBLIC_REVIEWS_API_URL`.

## 6. Kompatibilita Runtimu v kódu
- **API cesty** musí exportovat `export const runtime = 'edge';`.
- **Statické stránky** (jako reference s `generateStaticParams`) nesmí mít nastaven `edge` runtime, aby mohly být vygenerovány jako čisté HTML během buildu.
