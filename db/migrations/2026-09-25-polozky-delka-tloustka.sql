-- Položka nabídky má vlastní délku a tloušťku; řezná plocha (m²) se z nich počítá.
ALTER TABLE quote_items ADD COLUMN length_m REAL;
ALTER TABLE quote_items ADD COLUMN thickness_cm REAL;
