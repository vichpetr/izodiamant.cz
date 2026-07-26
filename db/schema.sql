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
