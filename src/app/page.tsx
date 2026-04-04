'use client';

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Technology = dynamic(() => import("@/components/Technology"), { ssr: true });
const PricingCalculator = dynamic(() => import("@/components/PricingCalculator"), { ssr: false });
const References = dynamic(() => import("@/components/References"), { ssr: false });
const HomeReviews = dynamic(() => import("@/components/HomeReviews"), { ssr: false });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"), { ssr: false });
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
