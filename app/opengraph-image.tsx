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
        }}
      >
        <img
          src={logoSrc}
          width={480}
          height={180}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
