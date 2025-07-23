import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { CartProvider } from "./CartContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://vistro.shop'),
  title: {
    template: '%s | Vistro.shop',
    default: 'Buy Premium Roblox Assets | Models, Scripts & Vehicles | Vistro.shop'
  },
  description: "Explore high-quality Roblox assets, vehicles, maps, scripts, and full games at Vistro.shop. Trusted by developers for realistic, ready-to-use content. Buy now!",
  keywords: [
    "Roblox assets for sale",
    "buy Roblox models",
    "Roblox game assets store",
    "premium Roblox development assets",
    "Roblox scripts and systems",
    "full Roblox games for sale",
    "best Roblox asset shop",
    "Roblox game development store",
    "custom Roblox assets",
    "Vistro Roblox store",

    "Roblox vehicle models",
    "buy Roblox cars",
    "realistic Roblox vehicles",
    "Roblox aviation assets",
    "Roblox planes for sale",
    "Roblox helicopters and aircraft",
    "Roblox aviation scripts",
    "vehicle systems Roblox",
    "flight systems Roblox",

    "Roblox game systems",
    "admin script Roblox",
    "gamepass script Roblox",
    "custom Roblox scripts",
    "weapon scripts Roblox",
    "realistic game systems Roblox",
    "full system packs Roblox",
    "combat systems Roblox",

    "Roblox maps for sale",
    "complete Roblox game kits",
    "full Roblox games to buy",
    "pre-built Roblox games",
    "roleplay maps Roblox",
    "simulator game kits Roblox",
    "map bundles for Roblox",

    "buy high-quality Roblox assets",
    "premium Roblox asset store",
    "trusted Roblox asset shop",
    "cheap Roblox game assets",
    "realistic Roblox models",
    "top Roblox development store",
    "UK Roblox dev marketplace",
    "download Roblox game content",

    "Vistro.shop Roblox assets",
    "Vistro Roblox store",
    "Vistro game development",
    "buy Roblox assets from Vistro",
    "Vistro.shop vehicle models",
    "Vistro Roblox full games"
  ],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Vistro.shop',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
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
    <html lang="en">
      <head />
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}