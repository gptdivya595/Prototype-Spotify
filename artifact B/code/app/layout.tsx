import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discovery Compass",
  description: "An intent-guided music discovery experiment for active explorers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
