-- Schéma pro skrytou admin sekci /sprava (Cloudflare D1).
-- Aplikace: `wrangler d1 execute <DB> --file=db/schema.sql` (prod i lokálně, viz deployment.MD).

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  project TEXT,               -- popis zakázky / poznámka
  job_size TEXT,              -- velikost / hodnota zakázky (Kč nebo bm)
  source TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'kontakt' | 'kalkulacka'
  realized_at TEXT,           -- datum realizace (volitelné, ISO)
  created_at TEXT NOT NULL,   -- ISO čas vzniku záznamu
  created_by TEXT             -- e-mail admina, nebo 'system' u automatických poptávek
);

CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,       -- 'sent' | 'error'
  resend_id TEXT,             -- id z Resend odpovědi
  error TEXT,
  sent_by TEXT NOT NULL,      -- e-mail přihlášeného admina
  sent_at TEXT NOT NULL       -- ISO čas odeslání
);

CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at DESC);

-- ─── Cenové nabídky (/sprava/nabidky + quotes-worker) ───────────────────────
-- Klient je ve snapshotu (client_*), aby nabídka zůstala čitelná i po úpravě nebo
-- smazání zákazníka v CRM (customer_id pak jen zneplatní).

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT UNIQUE,                     -- NAB-YYYYMMDD-XXX, přidělí se při prvním PDF
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  site_name TEXT,                         -- objekt, např. „Bytový dům č.p. 575“
  site_address TEXT,                      -- ulice / obec
  city TEXT,                              -- obec (přípona čísla nabídky)
  material TEXT,                          -- cihla | kamen | beton | jine
  thickness_cm REAL,
  length_m REAL,
  mode TEXT NOT NULL DEFAULT 'kombinace', -- 'kombinace' (položky se sčítají) | 'varianty' (každá zvlášť)
  transport_price INTEGER NOT NULL DEFAULT 0,
  intro TEXT,                             -- úvodní odstavec do PDF (volitelný, jinak výchozí text)
  conditions TEXT,                        -- JSON pole textů „Technické podmínky“
  note TEXT,                              -- interní poznámka (do PDF nejde)
  status TEXT NOT NULL DEFAULT 'koncept', -- koncept | ceka_na_udaje | pripraveno | vygenerovano | odeslano | prijato | odmitnuto
  missing TEXT,                           -- JSON pole chybějících údajů (u nabídek z e-mailu)
  source TEXT NOT NULL DEFAULT 'manual',  -- manual | email
  inbox_message_id INTEGER,               -- zdrojový e-mail (inbox_messages.id)
  pdf_key TEXT,                           -- klíč v R2
  pdf_generated_at TEXT,
  email_subject TEXT,
  email_body TEXT,
  email_version INTEGER,                  -- verze PDF k odeslání (NULL = poslední)
  field_sources TEXT,                     -- JSON {pole: "odkud"} – původ údajů z AI (e-mail, plánek…)
  created_at TEXT NOT NULL,
  created_by TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  technology TEXT NOT NULL,               -- retezova-pila | diamantove-lano | chemicka-injektaz
  area_m2 REAL NOT NULL,
  price_per_m2 INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id, position);

CREATE TABLE IF NOT EXISTS quote_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'plan',      -- plan | priloha
  analysis TEXT,                          -- JSON návrh z AI (délka, tloušťka, m², zdůvodnění)
  relevance TEXT,                         -- vysoka | stredni | nizka | zadna (hodnocení AI)
  relevance_override TEXT,                -- totéž, ale nastavené člověkem (má přednost)
  relevance_reason TEXT,                  -- proč (např. „půdorys 1.PP s kótami“)
  doc_kind TEXT,                          -- pudorys | rez | pohled | situace | foto | vykaz | logo | jine
  include_in_email INTEGER NOT NULL DEFAULT 0, -- vyplněný výkaz přiložit k e-mailu
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_files_quote ON quote_files(quote_id);

-- Zprávy k nabídce: koncepty uložené do schránky, odeslané e-maily, odpovědi klienta.
CREATE TABLE IF NOT EXISTS quote_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,                -- out | in
  kind TEXT NOT NULL,                     -- draft | sent | reply
  subject TEXT,
  counterpart TEXT,                       -- adresa klienta
  message_id TEXT,                        -- RFC 5322 Message-ID
  status TEXT NOT NULL,                   -- ok | error
  error TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_quote_messages_quote ON quote_messages(quote_id, created_at DESC);

-- Každý e-mail ze schránky, který quotes-worker viděl (i nepoptávky), ať se
-- nezpracuje dvakrát. Klíčem je Message-ID.
CREATE TABLE IF NOT EXISTS inbox_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mailbox TEXT NOT NULL,
  message_id TEXT NOT NULL,
  from_email TEXT,
  from_name TEXT,
  subject TEXT,
  received_at TEXT,
  status TEXT NOT NULL,                   -- nabidka | dotaz | odpoved | ignorovano | chyba
  body_text TEXT,                         -- text zprávy (u HTML převedený), ať jde přečíst v adminu
  extracted TEXT,                         -- JSON výstup AI
  quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
  error TEXT,
  processed_at TEXT NOT NULL,
  UNIQUE (mailbox, message_id)
);

CREATE INDEX IF NOT EXISTS idx_inbox_processed ON inbox_messages(processed_at DESC);

-- Verze nabídky: každé vygenerování PDF po změně vstupů = nová verze.
CREATE TABLE IF NOT EXISTS quote_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  pdf_key TEXT NOT NULL,
  vykaz_key TEXT,                         -- vyplněný výkaz výměr k této verzi (R2) – první z vykaz_files
  vykaz_files TEXT,                       -- JSON [{key, technology}] – u variant výkaz za každou technologii
  input_hash TEXT NOT NULL,               -- otisk vstupů – bez změny nevzniká nová verze
  total_label TEXT,                       -- „67 500 Kč“ / „2 varianty“ pro přehled
  sent_at TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT,
  UNIQUE (quote_id, version)
);

CREATE INDEX IF NOT EXISTS idx_quote_versions_quote ON quote_versions(quote_id, version DESC);

-- Každé volání modelu (kvůli nákladům u komerčních modelů).
CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,                     -- triage | attachment | extract | text
  provider TEXT NOT NULL,                 -- zen | anthropic | cf
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  ms INTEGER,
  ok INTEGER NOT NULL,
  error TEXT,
  quote_id INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at DESC);

-- Drobný stav workeru (zámek pollingu, čas posledního běhu).
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL
);

-- Migrace existujících databází (CREATE TABLE IF NOT EXISTS výše sloupce nedoplní).
-- Spustit ručně jednou; podruhé skončí hláškou „duplicate column name“, což nevadí:
--   npx wrangler d1 execute izodiamant-db --remote --command \
--     "ALTER TABLE inbox_messages ADD COLUMN body_text TEXT"
