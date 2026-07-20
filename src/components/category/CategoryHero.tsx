import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CategoryHero({
  nameBn,
  image,
}: {
  nameBn: string;
  slug?: string;
  image?: string | null;
}) {
  const heroImage = image || "";

  return (
    <section className="relative min-h-[320px] md:min-h-[400px]">
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
        style={{
          backgroundImage: heroImage ? `url("${heroImage}")` : undefined,
          backgroundColor: heroImage ? undefined : "#1f3d2b",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative py-20">
        <nav className="text-sm mb-4 text-left" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-white/80 hover:text-white">
                হোম
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-white/60" />
            <li className="text-white font-medium">{nameBn}</li>
          </ol>
        </nav>
        <div className="max-w-5xl">
          <header>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white text-left">
              {nameBn}
            </h1>
          </header>
        </div>
      </div>
    </section>
  );
}
