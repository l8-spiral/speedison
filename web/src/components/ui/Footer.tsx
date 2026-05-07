import { COMPANY } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-noir-950 text-stone-400 py-16 px-6 md:px-12 border-t border-noir-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Besök oss</h3>
          <p className="leading-relaxed">{COMPANY.address}</p>
          <p className="mt-3">
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-copper-300">{COMPANY.phone}</a>
          </p>
          <p>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-copper-300">{COMPANY.email}</a>
          </p>
        </div>
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Öppettider</h3>
          <ul className="space-y-1">
            {COMPANY.hours.map(h => (
              <li key={h.days}>
                <span className="inline-block w-24">{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Följ oss</h3>
          <ul className="space-y-2">
            <li><a href={COMPANY.social.instagram} target="_blank" rel="noopener" className="hover:text-copper-300">Instagram</a></li>
            <li><a href={COMPANY.social.facebook} target="_blank" rel="noopener" className="hover:text-copper-300">Facebook</a></li>
          </ul>
          <p className="mt-8 text-xs text-stone-500">Org.nr {COMPANY.orgNr}</p>
          <p className="text-xs text-stone-500"><a href="/integritet" className="hover:text-copper-300">Integritetspolicy</a></p>
        </div>
      </div>
    </footer>
  );
}
