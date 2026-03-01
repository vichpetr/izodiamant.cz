import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import PricingCalculator from "@/components/PricingCalculator";
import References from "@/components/References";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Technology />
      <PricingCalculator />
      <References />
      <FAQ />
      <ContactForm />
      <Footer />
      <CookieConsent />
    </main>
  );
}
