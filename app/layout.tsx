import type { Metadata, Viewport } from "next";
import { Vollkorn, Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { InstallPromptProvider } from "@/components/InstallPromptProvider";
import InAppBrowserBanner from "@/components/InAppBrowserBanner";
import { Analytics } from "@vercel/analytics/react";

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
      "Gerakan doa harian untuk suku terabaikan di Indonesia.",
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-[var(--color-navy-deep)] antialiased">
        <div className="max-w-md mx-auto min-h-screen bg-[var(--color-cream)]">
          <InstallPromptProvider>
            <LanguageProvider>
              <InAppBrowserBanner />
              {children}
            </LanguageProvider>
          </InstallPromptProvider>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
