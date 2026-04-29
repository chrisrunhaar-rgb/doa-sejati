import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Doa Sejati — Berdoa untuk Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const imgData = await fetch(
    new URL("../public/og-image.png", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const imgSrc = `data:image/png;base64,${Buffer.from(imgData).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3346A8",
        }}
      >
        <img
          src={imgSrc}
          width={630}
          height={630}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
