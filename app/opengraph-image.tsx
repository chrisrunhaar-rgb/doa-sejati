import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Doa Sejati — Berdoa untuk Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await fetch(
    new URL("../public/icons/logo-ds-white.png", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoData).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D1E3D",
          fontFamily: "serif",
        }}
      >
        {/* Logo */}
        <img
          src={logoSrc}
          width={320}
          height={120}
          style={{ objectFit: "contain", marginBottom: 32 }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Berdoa untuk Indonesia
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.35)",
            marginTop: 16,
          }}
        >
          Gerakan doa harian untuk suku-suku yang belum terjangkau
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          doa-sejati.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
