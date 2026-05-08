import { COMPANY } from "@/lib/content";

export const metadata = { title: "Kontakt — Speedison" };

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-noir-900 pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Kontakt</span>
        <h1 className="text-4xl md:text-6xl text-stone-100 mt-2 mb-12" style={{ fontFamily: "var(--font-display)" }}>
          Kom förbi.
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Adress</h3>
            <p className="leading-relaxed text-stone-300">{COMPANY.address}</p>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mt-8 mb-4">Telefon</h3>
            <p>
              <a className="text-stone-100 hover:text-copper-300" href={`tel:${COMPANY.phoneTel}`}>
                {COMPANY.phone}
              </a>
            </p>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mt-8 mb-4">E-post</h3>
            <p>
              <a className="text-stone-100 hover:text-copper-300" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
            </p>
          </div>
          <div>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Öppettider</h3>
            <ul className="space-y-1 text-stone-300">
              {COMPANY.hours.map((h) => (
                <li key={h.days}>
                  <span className="inline-block w-24">{h.days}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=17.74%2C59.475%2C17.78%2C59.49&layer=mapnik&marker=59.4825%2C17.7625"
              className="mt-8 w-full h-64 border border-noir-700"
              loading="lazy"
              title="Karta över Mätarvägen 9A, Kungsängen"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
