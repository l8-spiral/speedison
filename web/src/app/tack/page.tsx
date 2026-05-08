import Link from "next/link";
import { COMPANY } from "@/lib/content";

type Props = { searchParams: Promise<{ ref?: string }> };

export const metadata = { title: "Tack — Speedison" };

export default async function TackPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-900 px-6">
      <div className="max-w-md text-center">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Tack!</span>
        <h1 className="text-4xl md:text-5xl text-stone-100 mt-2 mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Vi hör av oss inom 24 timmar.
        </h1>
        <p className="text-stone-400 mb-8">
          Behöver du nå oss snabbare? Ring{" "}
          <a href={`tel:${COMPANY.phoneTel}`} className="text-copper-300 underline">
            {COMPANY.phone}
          </a>
          .
        </p>
        {sp.ref && (
          <p className="text-stone-500 text-sm mb-8">
            Ärendenummer: <span className="text-copper-300">{sp.ref}</span>
          </p>
        )}
        <Link
          href="/"
          className="px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition tracking-[0.2em] uppercase"
        >
          Tillbaka till hem
        </Link>
      </div>
    </main>
  );
}
