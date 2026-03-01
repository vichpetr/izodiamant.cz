import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IZODIAMANT | Sanace a podřezávání zdiva",
  description: "Profesionální řešení vlhkého zdiva diamantovým lanem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
