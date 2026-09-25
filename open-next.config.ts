import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Web je SSG bez ISR (obsah se mění denním rebuildem, viz deploy-web.yml), takže
// předrenderované stránky stačí číst ze statických assetů – bez KV/R2 cache.
// Dynamické jsou jen /sprava/* a /api/* (renderují se při každém požadavku).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
