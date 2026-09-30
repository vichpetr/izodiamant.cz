---
name: ci-check
description: Po každém pushi / otevření MR ověř stav CI a když něco spadne, oprav to. Načti po `git push`, po vytvoření PR a kdykoli uživatel zmíní neúspěšný pipeline/deploy.
---

# Kontrola CI po pushi

Nikdy nehlaš práci jako hotovou hned po pushi. Nejdřív zkontroluj pipeline.

1. Remote se v tomto repu jmenuje `github` (ne `origin`), hlavní větev je `master`:
   `git push -u github HEAD`, `gh pr create --base master --head <větev>`.
2. Zjisti stav: `gh pr checks <číslo>` (případně `gh run list --branch <větev>`).
   Počkej na dokončení (`gh run watch <run-id>`), pending není zelená.
3. U každého `fail`: `gh run view <run-id> --log-failed` (případně `--json workflowName,jobs`
   – job se jmenuje `deploy` ve více workflow, poznáš je podle `workflowName`).
4. Chybu **reprodukuj lokálně**, oprav příčinu, commitni, pushni a vrať se na krok 2.
   Neopravuj obcházením (žádné `continue-on-error`, vypínání kroků ani testů).
5. Do odpovědi napiš, které checky prošly a které ne. Nenasazené preview není „hotovo“.

## Známá úskalí
- **quotes-worker deploy** (`deploy-quotes-worker.yml`) musí volat `wrangler … --config wrangler.toml`.
  Bez toho wrangler vezme kořenový `wrangler.jsonc` webu → „entry-point file `.open-next/worker.js`
  was not found“. Ověření lokálně: `cd quotes-worker && npx wrangler deploy --config wrangler.toml --dry-run --env preview --outdir $TMPDIR/q`.
- Web (`deploy-web.yml`) se spouští na každý push mimo `quotes-worker/**`, quotes-worker workflow
  jen při změně jeho cest – oba mohou běžet současně, kontroluj oba.
