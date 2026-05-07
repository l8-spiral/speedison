"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="sv">
      <body style={{ background:"#0a0a0f", color:"#f0e0c8", padding:24, fontFamily:"sans-serif" }}>
        <h1>Något gick fel.</h1>
        <p>Ring 08-33 33 46 eller mejla info@speedison.se.</p>
        <button onClick={reset} style={{ marginTop:16 }}>Försök igen</button>
      </body>
    </html>
  );
}
