import { COMPANY } from "@/lib/content";

export const metadata = { title: "Integritetspolicy — Speedison" };

export default function IntegritetPage() {
  return (
    <main className="min-h-screen bg-noir-900 pt-32 pb-16 px-6 md:px-12">
      <article className="max-w-2xl mx-auto prose prose-invert prose-stone">
        <h1 className="text-4xl text-stone-100" style={{ fontFamily: "var(--font-display)" }}>Integritetspolicy</h1>
        <p className="text-stone-400">
          {COMPANY.name} (org.nr {COMPANY.orgNr}, {COMPANY.address}) hanterar personuppgifter enligt GDPR.
        </p>
        <h2>Vilka uppgifter samlar vi in</h2>
        <p>
          När du skickar en offertförfrågan via vår konfigurator sparar vi: ditt namn, telefonnummer,
          e-postadress, fritextmeddelande, samt fordonsuppgifter (märke, modell, motor, årsmodell)
          och vilka tjänster du har valt.
        </p>
        <h2>Varför</h2>
        <p>
          Uppgifterna används enbart för att svara på din förfrågan, lämna offert och, om du
          accepterar, utföra arbetet. Vi delar inte dina uppgifter med tredje part.
        </p>
        <h2>Hur länge</h2>
        <p>
          Lead-data sparas i 24 månader och raderas därefter. Du kan begära radering tidigare genom
          att kontakta oss på{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-copper-300">
            {COMPANY.email}
          </a>
          .
        </p>
        <h2>Säkerhet</h2>
        <p>
          Vi lagrar IP-adresser i hashad form (SHA-256) för spam- och skräppostskydd. Webbplatsen
          serveras alltid över HTTPS.
        </p>
        <h2>Cookies</h2>
        <p>
          Vi använder inte några spårnings-cookies. Webbplatsen sätter inga cookies utan ditt aktiva
          samtycke.
        </p>
        <h2>Kontakta oss</h2>
        <p>
          Frågor?{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-copper-300">
            {COMPANY.email}
          </a>{" "}
          · {COMPANY.phone}
        </p>
      </article>
    </main>
  );
}
