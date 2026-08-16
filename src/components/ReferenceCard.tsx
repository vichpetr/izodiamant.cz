import Link from 'next/link';
import Image from 'next/image';
import { Icons } from './Icons';
import { formatReferenceDate, type ReferenceProject } from '@/lib/references';

/**
 * Dlaždice reference. Sdílí ji výběr na homepage (#reference) i archiv
 * (/reference), aby se obě mřížky nemohly rozejít vzhledem ani markupem.
 */
export default function ReferenceCard({ project }: { project: ReferenceProject }) {
  return (
    <div className="group">
      <Link
        href={`/reference/${project.id}`}
        className="block relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-dark text-foreground"
      >
        <Image
          src={project.image}
          alt={`${project.title} – ${project.technology}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent opacity-80" />

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-primary/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg">
            <Icons.Calendar className="w-3 h-3" />
            {formatReferenceDate(project.date)}
          </div>
          {project.reviewId && (
            <div className="bg-white/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg border border-primary/20">
              <Icons.CheckCircle2 className="w-3 h-3 text-primary" />
              Ověřená reference
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
            <Icons.Diamond className="w-3 h-3" />
            {project.technology}
          </div>
          <div className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4 group-hover:text-primary transition-colors">
            {project.title}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
            <Icons.MapPin className="w-3 h-3 text-primary" />
            {project.location}
          </div>
        </div>

        <div className="absolute top-8 right-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-neutral-dark transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
          <Icons.ArrowUpRight className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}
