import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import { SectionSkeleton } from "@/components/Skeleton";

// Components that are SSR by default for SEO
const References = dynamic(() => import("@/components/References"));
const HomeReviews = dynamic(() => import("@/components/HomeReviews"));
const FAQ = dynamic(() => import("@/components/FAQ"));

// Interactive components with loading states
const PricingCalculator = dynamic(() => import("@/components/PricingCalculator"), { 
  loading: () => <SectionSkeleton />
});
const ContactForm = dynamic(() => import("@/components/ContactForm"), { 
  loading: () => <SectionSkeleton />
});

const Footer = dynamic(() => import("@/components/Footer"));

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
    </main>
  );
}
