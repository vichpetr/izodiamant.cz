import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import MotionProvider from "@/components/MotionProvider";
import WebMCP from "@/components/WebMCP";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://izodiamant.cz"),
    title: {
      default: "IZODIAMANT | Sanace a podřezávání vlhkého zdiva",
      template: "%s | IZODIAMANT"
    },
    description: "Odborně podřezáváme a izolujeme vlhké zdivo. Profesionální sanace nejmodernější technologií (diamantové lano, řetězová pila, chemická injektáž) po celé České republice. Vracíme zdraví vaší stavbě.",
    keywords: ["sanace zdiva", "podřezávání zdiva", "podřezání zdiva", "podřezání domu cena", "diamantové lano", "řetězová pila", "chemická injektáž", "odvlhčení zdiva", "sanace vlhkého zdiva", "hydroizolace", "izolace zdi", "izolace domu", "vzlínající vlhkost", "plísně ve zdivu", "vlhké zdivo", "sanace vlhkosti", "trvalé odstranění vlhkosti", "IZODIAMANT", "Nové Hrady", "Pardubice", "Žleby", "Sloupnice", "Skorkov", "Bernartice", "Staré Žďánice", "Polička"],
  authors: [{ name: "IZODIAMANT" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://izodiamant.cz',
    languages: {
      'cs-CZ': 'https://izodiamant.cz',
      'x-default': 'https://izodiamant.cz',
    },
  },
  other: {
    'seznam-wmt': 'Vz7SKZJRpsg1w5RIGrTU2589oyNqXmMf',
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { 'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    'preconnect': [
      'https://izodiamant-reviews-api.petr-c3c.workers.dev',
      'https://www.google-analytics.com'
    ]
  },
  creator: "IZODIAMANT",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://izodiamant.cz",
    siteName: "IZODIAMANT",
    title: "IZODIAMANT | Sanace a podřezávání vlhkého zdiva",
    description: "Profesionální sanace a podřezávání zdiva nejmodernější technologií. Od cihel po tvrdý kámen – vracíme zdraví vaší stavbě.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "IZODIAMANT Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IZODIAMANT | Sanace a podřezávání vlhkého zdiva",
    description: "Profesionální sanace a podřezávání zdiva nejmodernější technologií. Od cihel po tvrdý kámen – vracíme zdraví vaší stavbě.",
    images: ["/logo.png"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL;
  const firmyUrl = "https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://izodiamant.cz/#business",
    "name": "IZODIAMANT",
    "image": "https://izodiamant.cz/logo.png",
    "logo": "https://izodiamant.cz/logo.png",
    "description": "Profesionální sanace a podřezávání vlhkého zdiva nejmodernější technologií (diamantové lano, řetězová pila, chemická injektáž).",
    "url": "https://izodiamant.cz",
    "telephone": "+420737017012",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Mokrá Lhota 26",
      "addressLocality": "Nové Hrady",
      "postalCode": "53944",
      "addressCountry": "CZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "49.8517231",
      "longitude": "16.1432100"
    },
    "areaServed": [
      { "@type": "Country", "name": "Česká republika" },
      { "@type": "AdministrativeArea", "name": "Pardubický kraj" },
      { "@type": "AdministrativeArea", "name": "Královéhradecký kraj" },
      { "@type": "AdministrativeArea", "name": "Středočeský kraj" },
      { "@type": "AdministrativeArea", "name": "Hlavní město Praha" }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [firmyUrl, googleMapsUrl].filter(Boolean),
  };

  return (
    <html lang="cs" className="scroll-smooth">
      <head>
        <link rel="service-doc" href="/llms.txt" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link rel="openid-configuration" href="/.well-known/openid-configuration" />
        <link rel="oauth-protected-resource" href="/.well-known/oauth-protected-resource" />
        <link rel="agent-card" href="/.well-known/agent-card.json" />
        {/* Google Analytics Consent Mode Initialization */}
        <Script id="ga-consent" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Check if we already have consent stored
            const storedConsent = typeof window !== 'undefined' ? localStorage.getItem('cookie-consent') : null;
            
            gtag('consent', 'default', {
              'analytics_storage': storedConsent === 'true' ? 'granted' : 'denied',
              'ad_storage': storedConsent === 'true' ? 'granted' : 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>

        <Script id="json-ld-local-business" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} strategy="afterInteractive" />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <WebMCP />
        <MotionProvider>
          {children}
        </MotionProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
