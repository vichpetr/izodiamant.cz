-- Upravené AI prompty z /sprava/prompty. Bez řádku platí výchozí text z kódu
-- (src/lib/quotes/prompts.ts). Je i v schema.sql, které deploy aplikuje.
CREATE TABLE IF NOT EXISTS ai_prompts (
  key TEXT PRIMARY KEY,                   -- triage | attachment | plan | vykaz | email
  content TEXT NOT NULL,                  -- přepsané pokyny (schéma JSON zůstává v kódu)
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
