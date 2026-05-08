"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";
import { LeadSchema } from "@/lib/schemas";
import { submitLead } from "@/lib/api";
import { getPriceRange, formatPriceRange, getService } from "@/lib/pricing";

export function StepContact() {
  const state = useConfiguratorStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const range = getPriceRange(state.selectedServices);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      vehicle: state.vehicle,
      services: state.selectedServices,
      contact: { name, phone, email, message },
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
        window.location.href = `/tack?ref=${encodeURIComponent(res.ref)}`;
      } else {
        setErrors({ _: "Det gick inte att skicka. Vänligen ring 08-33 33 46." });
      }
    } catch {
      setErrors({ _: "Det gick inte att nå servern. Ring 08-33 33 46 eller mejla info@speedison.se." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <button type="button" onClick={() => state.goToStep(4)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">
        ← Byt tjänster
      </button>
      <h3 className="text-3xl text-stone-100 mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Hur når vi dig?
      </h3>

      <div className="bg-noir-800 p-6 mb-6 border border-noir-700">
        <div className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Sammanfattning</div>
        <div className="text-stone-200">
          {state.vehicle.make} {state.vehicle.model}
        </div>
        <div className="text-stone-400 text-sm">
          {state.vehicle.engine}
          {state.vehicle.year ? ` (${state.vehicle.year})` : ""}
        </div>
        <ul className="mt-3 text-stone-300 text-sm">
          {state.selectedServices.map((s) => (
            <li key={s}>· {getService(s)?.name}</li>
          ))}
        </ul>
        <div className="mt-3 text-copper-300 text-xl" style={{ fontFamily: "var(--font-display)" }}>
          {formatPriceRange(range.from, range.to)}
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Namn" value={name} onChange={setName} error={errors["contact.name"]} />
        <Field label="Telefon" value={phone} onChange={setPhone} error={errors["contact.phone"]} />
        <Field label="E-post" type="email" value={email} onChange={setEmail} error={errors["contact.email"]} />
        <Field label="Meddelande (valfritt)" value={message} onChange={setMessage} multiline />

        <input
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute -left-[9999px]"
          autoComplete="off"
        />

        <label className="flex items-start gap-3 text-sm text-stone-300">
          <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="mt-1" />
          <span>
            Jag har läst och godkänner{" "}
            <a href="/integritet" className="text-copper-300 underline">
              integritetspolicyn
            </a>
            .
          </span>
        </label>
        {errors.gdprConsent && <div className="text-red-400 text-xs">{errors.gdprConsent}</div>}
        {errors._ && <div className="text-red-400 text-sm">{errors._}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto px-8 py-4 bg-copper-300 text-noir-900 hover:bg-copper-200 disabled:opacity-50 transition tracking-[0.2em] uppercase"
        >
          {submitting ? "Skickar..." : "Skicka offertförfrågan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  error?: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
        />
      )}
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </div>
  );
}
