# Deployment Guide: Cloudflare Pages

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz na platformu Cloudflare Pages pomocí adaptéru `next-on-pages`.

## 1. Příprava
- Projekt musí být nahrán v Git repozitáři (GitHub, GitLab).
- Musíte mít přístup k účtu na Cloudflare.

## 2. Vytvoření Pages Projektu
1. V Cloudflare dashboardu jdi na **Workers & Pages**.
2. Klikni na **Create application** -> **Pages** -> **Connect to Git**.
3. Vyber repozitář s tímto projektem.
4. **Build settings (KRITICKÉ PRO OPRAVU CHYBY 25MB):**
   - **Framework preset:** `None` (nevybírejte Next.js, nastavíme ručně)
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`

## 3. Nastavení Environmentálních proměnných
V nastavení Pages projektu (**Settings** -> **Environment variables**) přidejte proměnné:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_REVIEWS_API_URL`
- `NEXT_PUBLIC_FIRMY_PROFILE_URL`
- **NODE_VERSION:** `20` (přidejte tuto proměnnou, aby Cloudflare použil moderní Node.js)

## 4. Nastavení Cloudflare Workeru (Pro živé recenze)
1. **Workers & Pages** -> **Create application** -> **Create Worker**.
2. Použijte kód z README.md.
3. URL nasazeného Workeru vložte do `NEXT_PUBLIC_REVIEWS_API_URL`.

## 5. Kompatibilita
Tento postup využívá `next-on-pages`, který převede Next.js aplikaci do formátu kompatibilního s Cloudflare Workers (Edge Runtime). Tím se vyhnete nahrávání obří složky `.next/cache`, která způsobuje chybu s limitem 25MB.
