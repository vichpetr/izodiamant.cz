# Deployment Guide: Cloudflare Pages

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz na platformu Cloudflare Pages.

## 1. Příprava
- Projekt musí být nahrán v Git repozitáři (GitHub, GitLab).
- Musíte mít přístup k účtu na Cloudflare.

## 2. Vytvoření Pages Projektu
1. V Cloudflare dashboardu jdi na **Workers & Pages**.
2. Klikni na **Create application** -> **Pages** -> **Connect to Git**.
3. Vyber repozitář s tímto projektem.
4. **Build settings:**
   - **Framework preset:** `Next.js`
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
   - **Root directory:** `/` (ponechte výchozí)

## 3. Nastavení Environmentálních proměnných
V nastavení Pages projektu (**Settings** -> **Environment variables**) přidejte proměnné, které jsou definovány v `README.md`. 
**Důležité:** Přidejte je jak pro fázi "Production", tak pro "Preview".

## 4. Nastavení Cloudflare Workeru (Pro živé recenze)
Aby fungovaly živé recenze, musíte vytvořit samostatný Worker:
1. **Workers & Pages** -> **Create application** -> **Create Worker**.
2. Použijte kód uvedený v návodu, který parsuje data z Firmy.cz.
3. Po nasazení zkopírujte URL tohoto Workeru a vložte ji do proměnné `NEXT_PUBLIC_REVIEWS_API_URL` v nastavení Pages.

## 5. Vlastní doména
1. V nastavení Pages jdi na záložku **Custom domains**.
2. Klikni na **Set up a custom domain**.
3. Zadej `izodiamant.cz` (nebo jinou cílovou doménu).
4. Cloudflare automaticky nastaví potřebné DNS záznamy a vygeneruje SSL certifikát.

## 6. Poznámka k Next.js na Cloudflare
Tento projekt je optimalizován pro statický export nebo běh přes Cloudflare Pages plugin. Pokud používáte pokročilé dynamické funkce (jako je např. Image Optimization přes externí loader), ujistěte se, že máte v `next.config.ts` nastaven kompatibilní režim pro Cloudflare.
