import Image from "next/image";

export default function Partners() {
  return (
    <section className="py-16 bg-white" id="spolupracujeme" aria-labelledby="spolupracujeme-nadpis">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="spolupracujeme-nadpis"
          className="text-2xl md:text-3xl font-black text-neutral-dark uppercase tracking-tighter italic text-center mb-10"
        >
          Spolupracujeme
        </h2>
        <a
          href="https://freedepot.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-neutral-light p-8 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all"
        >
          <Image
            src="/images/partners/freedepot.webp"
            alt="FREEDEPOT s.r.o. – výroba plastových fólií"
            width={500}
            height={125}
            className="w-56 h-auto shrink-0 rounded-lg bg-white"
          />
          <p className="text-neutral-dark/70 font-medium leading-relaxed text-center sm:text-left">
            FREEDEPOT s.r.o. je český výrobce nopových, hydroizolačních a protikořenových fólií
            z recyklovaného polyetylenu. Fólie vyrábí na míru ve Stržanově u Žďáru nad Sázavou.
            <span className="block mt-2 font-bold text-primary-ink">freedepot.cz</span>
          </p>
        </a>
      </div>
    </section>
  );
}
