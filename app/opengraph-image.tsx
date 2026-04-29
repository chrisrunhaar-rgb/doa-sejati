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
        {/* Subtle glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 300,
            width: 600,
            height: 360,
            background: "radial-gradient(ellipse at center, rgba(100,160,255,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <img
          src={logoSrc}
          width={340}
          height={128}
          style={{ objectFit: "contain", marginBottom: 36 }}
        />

        {/* Accent divider */}
        <div
          style={{
            width: 60,
            height: 3,
            background: "rgba(255,255,255,0.5)",
            marginBottom: 28,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 34,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Berdoa untuk Indonesia
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            marginTop: 18,
            maxWidth: 700,
            textAlign: "center",
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
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.06em",
          }}
        >
          doa-sejati.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
