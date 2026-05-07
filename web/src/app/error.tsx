"use client";
import { useEffect } from "react";
import { COMPANY } from "@/lib/content";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-900 text-copper-100 px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl mb-4">Något gick fel.</h1>
        <p className="mb-6 text-stone-400">
          Ring oss på <a href={`tel:${COMPANY.phoneTel}`} className="text-copper-300 underline">{COMPANY.phone}</a>{" "}
          eller mejla <a href={`mailto:${COMPANY.email}`} className="text-copper-300 underline">{COMPANY.email}</a>.
        </p>
        <button onClick={reset} className="px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition">
          Försök igen
        </button>
      </div>
    </main>
  );
}
