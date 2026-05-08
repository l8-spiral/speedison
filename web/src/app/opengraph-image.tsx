import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Speedison — Performance reimagined";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0f",
          color: "#f0e0c8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: 96,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#d4a574",
          }}
        >
          Speedison
        </div>
        <div style={{ fontSize: 96, marginTop: 24, lineHeight: 1, fontWeight: 300 }}>
          Vi tämjer
        </div>
        <div
          style={{
            fontSize: 96,
            fontStyle: "italic",
            lineHeight: 1,
            color: "#d4a574",
          }}
        >
          maskinen.
        </div>
      </div>
    ),
    size
  );
}
