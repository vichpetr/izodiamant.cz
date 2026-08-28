'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icons } from './Icons';

interface ProjectGalleryProps {
  /** Cesty k fotkám i videím z `references.json` (gallery). */
  media: string[];
  title: string;
  /** Použitá technologie – jde do alt textů (viz SEO konvence v CLAUDE.md). */
  technology?: string;
}

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export function isVideo(src: string): boolean {
  return VIDEO_EXT.test(src);
}

/**
 * Náhled videa. Konvence: vedle `5.mp4` leží `5.jpg` (vygenerovaný snímek).
 * Když soubor chybí, prohlížeč jen ukáže první snímek videa – nic se nerozbije.
 */
function posterFor(src: string): string {
  return src.replace(VIDEO_EXT, '.jpg');
}

export default function ProjectGallery({ media, title, technology }: ProjectGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const current = media[currentIndex];
  const currentIsVideo = isVideo(current);
  const suffix = technology ? ` – ${technology}` : '';

  return (
    <div className="relative group aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-dark">
        {/* key={currentIndex} = přepnutí slidu prvek odmountuje, takže se
            přehrávané video samo zastaví (jinak by hrálo dál na pozadí). */}
        <div
          key={currentIndex}
          className="relative w-full h-full"
        >
          {currentIsVideo ? (
            <video
              src={current}
              poster={posterFor(current)}
              controls
              playsInline
              preload="metadata"
              aria-label={`${title}${suffix} – video ${currentIndex + 1}`}
              className="w-full h-full object-contain bg-black"
            >
              Váš prohlížeč nepodporuje přehrávání videa.
            </video>
          ) : (
            <Image
              src={current}
              alt={`${title}${suffix} – foto ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-cover"
              priority={currentIndex === 0}
            />
          )}
        </div>


      {/* Navigation Controls (Only if multiple images) */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-primary hover:text-neutral-dark transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Předchozí"
          >
            <Icons.ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-primary hover:text-neutral-dark transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Další"
          >
            <Icons.ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator – u videa posunuté nad nativní ovládací lištu,
              aby si tečky a přehrávač nepřekrývaly kliknutí. */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 flex gap-2 z-10 ${
              currentIsVideo ? 'bottom-16' : 'bottom-6'
            }`}
          >
            {media.map((src, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/60 w-2'
                } ${isVideo(src) ? 'ring-2 ring-primary/60 ring-offset-0' : ''}`}
                aria-label={isVideo(src) ? `Přejít na video ${index + 1}` : `Přejít na obrázek ${index + 1}`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 z-10">
            {currentIsVideo && <Icons.PlayCircle className="w-3.5 h-3.5 text-primary" />}
            {currentIndex + 1} / {media.length}
          </div>
        </>
      )}
    </div>
  );
}
