import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://zemarket.com"),
  title: "ZeMarket — Le Marché N°1 au Cameroun",
  description:
    "Vendez et achetez partout au Cameroun en moins de 60 secondes. Téléphones, voitures, immobilier, mode et bien plus, en toute confiance.",
  keywords: [
    "ZeMarket",
    "marketplace Cameroun",
    "acheter vendre Cameroun",
    "annonces Douala",
    "annonces Yaoundé",
  ],
  openGraph: {
    title: "ZeMarket — Le Marché N°1 au Cameroun",
    description:
      "Vendez et achetez partout au Cameroun en moins de 60 secondes.",
    url: "https://zemarket.com",
    siteName: "ZeMarket",
    locale: "fr_CM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeMarket — Le Marché N°1 au Cameroun",
    description:
      "Vendez et achetez partout au Cameroun en moins de 60 secondes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
