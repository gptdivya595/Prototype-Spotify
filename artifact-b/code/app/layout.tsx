import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discovery Compass",
  description: "A dark, mobile-first intent-guided music discovery experience.",
  applicationName: "Discovery Compass",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Compass" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#060806"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
