'use client';

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SectionSkeleton } from "@/components/Skeleton";

const Technology = dynamic(() => import("@/components/Technology"), { ssr: true });
const PricingCalculator = dynamic(() => import("@/components/PricingCalculator"), { 
  ssr: false,
  loading: () => <SectionSkeleton />
});
const References = dynamic(() => import("@/components/References"), { 
  ssr: false,
  loading: () => <SectionSkeleton />
});
const HomeReviews = dynamic(() => import("@/components/HomeReviews"), { 
  ssr: false,
  loading: () => <SectionSkeleton />
});
const FAQ = dynamic(() => import("@/components/FAQ"), { 
  ssr: false,
  loading: () => <SectionSkeleton />
});
const ContactForm = dynamic(() => import("@/components/ContactForm"), { 
  ssr: false,
  loading: () => <SectionSkeleton />
});
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Technology />
      <PricingCalculator />
      <References />
      <HomeReviews />
      <FAQ />
      <ContactForm />
      <Footer />
      <CookieConsent />
    </main>
  );
}
