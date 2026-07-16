import { ImageResponse } from "next/og";

// Static export: render the card once at build time, not per request.
export const dynamic = "force-static";

export const alt = "dlm — Run models bigger than your VRAM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social card, generated at build time.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#07080a",
          backgroundImage:
            "radial-gradient(1000px 500px at 15% -10%, rgba(61,216,196,0.18), transparent), radial-gradient(900px 500px at 100% 120%, rgba(110,139,255,0.16), transparent)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#9c9c9d",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{ width: 14, height: 14, borderRadius: 99, background: "#3dd8c4" }}
          />
          dlm · Dynamic LLM
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 76,
            fontWeight: 700,
            color: "#f4f4f6",
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Run a 70B model on 16 GB of VRAM.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#9c9c9d",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          An open-source Rust inference engine that streams transformer layers
          through your GPU as it computes.
        </div>
      </div>
    ),
    { ...size }
  );
}
