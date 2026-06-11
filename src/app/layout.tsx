import type { Metadata, Viewport } from "next";
import { OfflineSupport } from '@/components/OfflineSupport';
import "./globals.css";

export const metadata: Metadata = {
  title: "Moto Travel Planner",
  description: "Roadbook operativo para rutas en moto con itinerario, mapas, GPX, presupuesto y alojamientos.",
  applicationName: "Moto Travel Planner",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Moto Planner",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <OfflineSupport />
      </body>
    </html>
  );
}
