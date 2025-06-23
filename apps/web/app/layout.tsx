import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { CartProvider } from "./CartContext";

export const metadata: Metadata = {
  title: "Vistro.shop",
  description: "Vistro.shop a store of roblox",
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