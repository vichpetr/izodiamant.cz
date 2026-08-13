// Vlastní next/image loader využívající Cloudflare Image Resizing (/cdn-cgi/image/).
// Cloudflare vrací zmenšený AVIF/WebP podle zařízení a Accept hlavičky – na
// produkci ověřeno (782 kB JPEG → ~23 kB AVIF, viz PR). Nutná podmínka na straně
// Cloudflare: zapnuté „Transformations" pro zónu (na izodiamant.cz jsou).
//
// Aktivuje se jen když NEXT_PUBLIC_CF_IMAGES === 'true'. Tuto proměnnou nastavuje
// next.config.ts automaticky na buildu Cloudflare Pages (podle CF_PAGES). V dev,
// CI a Playwrightu (spouští se přes `npm run start` bez CF_PAGES) zůstává vypnutá,
// takže loader vrací původní src a /cdn-cgi/image na localhostu nic nerozbije.
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareImageLoader({ src, width, quality }: LoaderArgs): string {
  // Transformujeme jen lokální obrázky (cesta začíná '/'); externí URL (unsplash)
  // i data: URI necháváme beze změny.
  if (process.env.NEXT_PUBLIC_CF_IMAGES !== 'true' || !src.startsWith('/')) {
    return src;
  }
  const options = `format=auto,width=${width},quality=${quality ?? 75}`;
  return `/cdn-cgi/image/${options}${src}`;
}
