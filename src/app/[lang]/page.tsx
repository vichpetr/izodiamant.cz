import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import PricingCalculator from "@/components/PricingCalculator";
import References from "@/components/References";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export async function generateStaticParams() {
  return [{ lang: "cs" }, { lang: "en" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="min-h-screen">
      <Header lang={lang} />
      <Hero lang={lang} />
      <Technology lang={lang} />
      <PricingCalculator lang={lang} />
      <References lang={lang} />
      <FAQ lang={lang} />
      <ContactForm lang={lang} />
      <Footer lang={lang} />
      <CookieConsent />
    </main>
  );
}
