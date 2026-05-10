"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";
import { LeadSchema } from "@/lib/schemas";
import { submitLead } from "@/lib/api";
import { SERVICES, type ServiceSlug } from "@/lib/pricing";
import { track } from "@/lib/analytics";

export function Configurator() {
  const selected = useConfiguratorStore((s) => s.selectedServices);
  const addService = useConfiguratorStore((s) => s.addService);

  const [regNumber, setRegNumber] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      regNumber: regNumber.trim().toUpperCase(),
      services: selected,
      contact: { name, phone, email },
      description,
      gdprConsent: gdpr,
      honeypot,
    };
    const parsed = LeadSchema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path.join(".")] = issue.message;
      }
      setErrors(map);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const res = await submitLead(parsed.data);
      if (res.ok) {
        track("lead_submitted", { ref: res.ref });
        window.location.href = `/tack?ref=${encodeURIComponent(res.ref)}`;
      } else {
        track("lead_failed", { reason: res.error });
        setErrors({ _: "Det gick inte att skicka. Vänligen ring 08-33 33 46." });
      }
    } catch {
      track("lead_failed", { reason: "network" });
      setErrors({
        _: "Det gick inte att nå servern. Ring 08-33 33 46 eller mejla info@speedison.se.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="konfigurator" className="bg-noir-950 py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Få en offert</span>
        <h2
          className="text-4xl md:text-6xl text-stone-100 mt-2 mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Begär offert.
        </h2>
        <p className="text-stone-400 mb-12 max-w-xl">
          Pris sätts efter bil och tjänst. Fyll i formuläret så återkommer vi inom 24 timmar med
          ett konkret förslag.
        </p>

        <form onSubmit={onSubmit} className="space-y-10">
          <ServicesSection
            selected={selected}
            toggle={addService}
            error={errors["services"]}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Field
              label="Registreringsnummer"
              value={regNumber}
              onChange={(v) => setRegNumber(v.toUpperCase())}
              placeholder="ABC 123"
              error={errors["regNumber"]}
              autoCapitalize="characters"
            />
            <Field
              label="Namn"
              value={name}
              onChange={setName}
              placeholder="För- och efternamn"
              error={errors["contact.name"]}
            />
            <Field
              label="Telefon"
              value={phone}
              onChange={setPhone}
              placeholder="070 123 45 67"
              type="tel"
              error={errors["contact.phone"]}
            />
            <Field
              label="E-post"
              value={email}
              onChange={setEmail}
              placeholder="namn@exempel.se"
              type="email"
              error={errors["contact.email"]}
            />
          </div>

          <Field
            label="Beskrivning"
            value={description}
            onChange={setDescription}
            placeholder="Berätta kort om bilen och vad du vill ha gjort."
            multiline
            error={errors["description"]}
          />

          {/* honeypot — invisible to humans, attractive to bots */}
          <input
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute -left-[9999px]"
            autoComplete="off"
          />

          <label className="flex items-start gap-3 text-sm text-stone-300">
            <input
              type="checkbox"
              checked={gdpr}
              onChange={(e) => setGdpr(e.target.checked)}
              className="mt-1"
            />
            <span>
              Jag har läst och godkänner{" "}
              <a href="/integritet" className="text-copper-300 underline">
                integritetspolicyn
              </a>
              .
            </span>
          </label>
          {errors.gdprConsent && (
            <div className="text-red-400 text-xs -mt-6">{errors.gdprConsent}</div>
          )}
          {errors._ && <div className="text-red-400 text-sm">{errors._}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-8 py-4 bg-copper-300 text-noir-900 hover:bg-copper-200 disabled:opacity-50 transition tracking-[0.2em] uppercase"
          >
            {submitting ? "Skickar..." : "Skicka offertförfrågan"}
          </button>
        </form>
      </div>
    </section>
  );
}

function ServicesSection({
  selected,
  toggle,
  error,
}: {
  selected: ServiceSlug[];
  toggle: (s: ServiceSlug) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-3">
        Vilken / vilka tjänster?
      </legend>
      <div className="grid sm:grid-cols-2 gap-3">
        {SERVICES.map((s) => {
          const isOn = selected.includes(s.slug);
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => toggle(s.slug)}
              aria-pressed={isOn}
              className={`p-4 text-left border transition ${
                isOn
                  ? "border-copper-300 bg-copper-300/10 text-stone-100"
                  : "border-noir-700 hover:border-copper-300 text-stone-200"
              }`}
            >
              <div className="text-base" style={{ fontFamily: "var(--font-display)" }}>
                {s.name}
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mt-1">{s.description}</p>
            </button>
          );
        })}
      </div>
      {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  autoCapitalize?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
        />
      )}
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </div>
  );
}
