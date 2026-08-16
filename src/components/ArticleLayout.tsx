import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import { breadcrumbSchema } from "@/lib/seo";

/**
 * Společný obal článku (/clanky/<slug>) – hlavička, návrat na přehled, hero,
 * tělo, CTA a patička + JSON-LD (Article + Breadcrumb). Jednotlivé stránky
 * článků dodávají jen metadata a obsah, ať se nechrome neduplikuje.
 */
export default function ArticleLayout({
  slug,
  title,
  description,
  published,
  eyebrow = "Rádce · Sanace zdiva",
  intro,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  published: string;
  eyebrow?: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const url = `https://izodiamant.cz/clanky/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": "https://izodiamant.cz/og-image.jpg",
    "datePublished": published,
    "dateModified": published,
    "author": { "@type": "Organization", "name": "IZODIAMANT" },
    "publisher": {
      "@type": "Organization",
      "name": "IZODIAMANT",
      "logo": { "@type": "ImageObject", "url": "https://izodiamant.cz/logo.png" },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
  };
  const breadcrumb = breadcrumbSchema([
    { name: "Domů", path: "/" },
    { name: "Články", path: "/clanky" },
    { name: title, path: `/clanky/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-neutral-light">
      {/* JSON-LD jako plain <script>, aby byl v serverovém HTML i pro crawlery bez JS. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />

      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clanky" className="inline-flex items-center gap-2 text-neutral-dark/60 hover:text-primary font-bold uppercase tracking-widest text-xs mb-10 transition-colors group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Zpět na články
          </Link>

          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">{eyebrow}</div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.92] mb-8 text-balance">
            {title}
          </h1>
          <div className="text-xl text-neutral-dark/70 font-medium leading-relaxed">{intro}</div>

          <div className="mt-12 space-y-6">{children}</div>

          <div className="mt-14 bg-neutral-dark rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 -rotate-12 translate-x-12 -translate-y-12" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-3">Řešíte vlhké zdivo?</h2>
              <p className="text-white/70 font-medium mb-8 max-w-xl">
                Ozvěte se nám na nezávaznou prohlídku zdarma. Změříme vlhkost a navrhneme nejvhodnější postup na míru vaší
                stavbě. Vracíme zdraví vaší stavbě.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Nezávazná kalkulace
                </Link>
                <a href="tel:+420737017012" className="inline-flex items-center gap-2 py-4 px-8 rounded-xl border-2 border-white/15 font-black uppercase tracking-widest text-sm text-white hover:border-primary/40 transition-colors">
                  <Icons.Phone className="w-4 h-4 text-primary" /> +420 737 017 012
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

/** Sdílené prvky obsahu článků – nadpis sekce a odstavec s jednotným stylem. */
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark pt-6">{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral-dark/80 leading-relaxed">{children}</p>;
}

/** Prokliky na stránky služeb (interní prolinkování). */
export function ServiceLinks({ items }: { items: { href: string; label: string; note: string }[] }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 pt-2">
      {items.map((s) => (
        <Link key={s.href} href={s.href} className="group bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:border-primary/30 transition-all">
          <div className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors mb-1">{s.label}</div>
          <p className="text-neutral-dark/60 text-xs leading-relaxed">{s.note}</p>
        </Link>
      ))}
    </div>
  );
}
