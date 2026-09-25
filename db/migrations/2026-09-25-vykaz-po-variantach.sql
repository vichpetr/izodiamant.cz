-- U variant vzniká vyplněný výkaz výměr za každou technologii zvlášť.
ALTER TABLE quote_versions ADD COLUMN vykaz_files TEXT;
