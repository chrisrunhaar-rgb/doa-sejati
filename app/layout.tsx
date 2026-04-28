import type { Metadata, Viewport } from "next";
import { Vollkorn, Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

const vollkorn = Vollkorn({
  variable: "--font-vollkorn",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doa Sejati — Berdoa untuk Indonesia",
  description:
    "Bergabunglah dengan ribuan orang Indonesia yang berdoa setiap hari untuk suku-suku yang belum mengenal Yesus. One prayer. One tap. One nation.",
  applicationName: "Doa Sejati",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Doa Sejati",
  },
  openGraph: {
    title: "Doa Sejati — Berdoa untuk Indonesia",
    description:
      "Gerakan doa harian untuk 234 suku yang belum terjangkau di Indonesia.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1E3D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${vollkorn.variable} ${manrope.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/logo-white.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-[var(--color-cream)] antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
      </body>
    </html>
  );
}
