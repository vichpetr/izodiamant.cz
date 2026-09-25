-- Etapa 2 cenových nabídek: sloupce, které CREATE TABLE IF NOT EXISTS do existujících
-- tabulek nepřidá. Spustit jednou na každé DB; opakované spuštění skončí hláškou
-- „duplicate column name“, což nevadí. Nové tabulky (quote_versions, ai_usage)
-- zakládá db/schema.sql.
ALTER TABLE quotes ADD COLUMN email_version INTEGER;
ALTER TABLE quotes ADD COLUMN field_sources TEXT;
ALTER TABLE quote_files ADD COLUMN relevance TEXT;
ALTER TABLE quote_files ADD COLUMN relevance_override TEXT;
ALTER TABLE quote_files ADD COLUMN relevance_reason TEXT;
ALTER TABLE quote_files ADD COLUMN doc_kind TEXT;
ALTER TABLE quote_files ADD COLUMN include_in_email INTEGER NOT NULL DEFAULT 0;
