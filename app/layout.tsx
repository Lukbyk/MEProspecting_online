import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospecting - Media Energetyczne",
  description: "Webowe MVP operatora prospectingu Media Energetyczne"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
