import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Technology = dynamic(() => import("@/components/Technology"), { ssr: true });
const PricingCalculator = dynamic(() => import("@/components/PricingCalculator"), { ssr: true });
const References = dynamic(() => import("@/components/References"), { ssr: true });
const HomeReviews = dynamic(() => import("@/components/HomeReviews"), { ssr: true });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: true });
const ContactForm = dynamic(() => import("@/components/ContactForm"), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: true });

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
