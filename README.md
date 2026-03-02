# IZODIAMANT.cz – Moderní Web 2026

Tento projekt představuje kompletní modernizaci webu IZODIAMANT.cz. Aplikace je postavena na frameworku Next.js s důrazem na vysoký konverzní poměr, rychlost a snadnou správu obsahu skrze datové soubory.

## 🛠️ Technologický Stack

- **Framework:** Next.js 15+ (App Router)
- **Jazyk:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Animace:** Framer Motion
- **E-mailové služby:** Resend.io
- **Datové zdroje:** JSON soubory (pro snadnou úpravu obsahu)
- **Externí integrace:** Cloudflare Worker (pro živé recenze z Firmy.cz)

## ⚙️ Konfigurace (.env)

Aplikace vyžaduje pro svůj běh následující environmentální proměnné. Bez jejich definice aplikace vyhodí chybu (striktní mód).

```env
# API klíč ze služby resend.com pro odesílání formulářů
RESEND_API_KEY=re_123456789

# URL vašeho Cloudflare Workeru, který vrací JSON s recenzemi
NEXT_PUBLIC_REVIEWS_API_URL=https://izodiamant-reviews-api.vas-ucet.workers.dev

# Celá URL adresa vašeho profilu na Firmy.cz
NEXT_PUBLIC_FIRMY_PROFILE_URL=https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html
```

## 📂 Správa obsahu (Data Files)

Většina obsahu webu je oddělena od kódu a nachází se v adresáři `src/data/`. To umožňuje úpravy bez nutnosti programování:

- `calculator.json`: Definice materiálů pro kalkulačku, jejich popisy a základní ceny (`basePrice`) za m².
- `services.json`: Textové ceníky a doby realizace zobrazené na podstránkách služeb.
- `references.json`: Seznam realizací. Obsahuje ID, titul, lokalitu, datum (YYYY-MM), technologii a cesty k obrázkům. Podporuje interaktivní "Před/Po" posuvník (pokud jsou `before` a `after` rozdílné).
- `faq.json`: Seznam otázek a odpovědí pro sekci Časté dotazy.
- `reviews.json`: Statický fallback recenzí, který se použije, pokud selže živé API.

## 🔄 Integrace Firmy.cz (Živé recenze)

Web využívá architekturu "Proxy API" skrze Cloudflare Worker:
1. **Worker:** Na straně Cloudflare běží skript, který parsuje HTML widget Seznamu.
2. **Endpoint:** Worker vrací čistá data (počet hvězd, texty recenzí) ve formátu JSON.
3. **Frontend:** Komponenty `FirmyBadge` a `HomeReviews` si tato data stahují a vykreslují je v brandovém designu webu.

## 🚀 Vývoj a spuštění

1. **Instalace:** `npm install`
2. **Spuštění:** `npm run dev`
3. **Build:** `npm run build`

Pro podrobný návod k nasazení viz [deployment.MD](./deployment.MD).
