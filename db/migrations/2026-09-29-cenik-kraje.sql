-- Ceník po krajích a automatická doprava: sloupce nabídky, které CREATE TABLE IF
-- NOT EXISTS do existující tabulky nepřidá. Tabulku settings zakládá db/schema.sql.
-- Opakované spuštění skončí hláškou „duplicate column name“, což nevadí.
ALTER TABLE quotes ADD COLUMN region TEXT;
ALTER TABLE quotes ADD COLUMN distance_km REAL;
ALTER TABLE quotes ADD COLUMN transport_calc TEXT;
