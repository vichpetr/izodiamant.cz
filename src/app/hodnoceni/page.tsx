import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, MessageSquare, Quote, ExternalLink } from "lucide-react";
import reviewsData from "@/data/reviews.json";
import Link from "next/link";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  referenceId?: string;
}

export default function ReviewsPage() {
  const reviews = reviewsData as Review[];

  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-dark mb-6 uppercase tracking-tighter italic leading-none">
              Hodnocení <br /><span className="text-primary">našich zákazníků</span>
            </h1>
            <p className="text-lg text-neutral-dark/60 font-medium mb-8">
              Vaše spokojenost je pro nás nejlepší vizitkou. Zakládáme si na poctivém řemesle a férovém přístupu.
            </p>
            <Link 
              href="https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html" 
              target="_blank"
              className="btn-outline py-3 px-8 text-sm uppercase tracking-widest flex items-center gap-3 mx-auto w-fit"
            >
              Všechny recenze na Firmy.cz
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-10 rounded-[2rem] shadow-sm border border-neutral-dark/5 flex flex-col h-full relative overflow-hidden group">
                <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
                
                <div className="flex items-center gap-1 text-primary mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-lg text-neutral-dark/80 font-medium italic leading-relaxed mb-10 flex-grow">
                  "{review.text}"
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-neutral-light mt-auto">
                  <div>
                    <div className="font-black text-neutral-dark uppercase tracking-tight italic">{review.author}</div>
                    <div className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-widest">{review.date}</div>
                  </div>
                  
                  {review.referenceId && (
                    <Link 
                      href={`/reference/${review.referenceId}`}
                      className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center text-primary hover:bg-primary hover:text-neutral-dark transition-all shadow-inner"
                      title="Zobrazit realizaci"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
