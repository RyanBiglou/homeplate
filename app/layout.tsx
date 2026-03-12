import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/order/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HomePlate — Home-Cooked Meals from MEHKO Permitted Kitchens",
  description:
    "Discover and order same-day home-cooked meals from MEHKO-permitted home cooks in your California neighborhood.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans antialiased", inter.variable)}>
      <body className="min-h-screen bg-background">
        {children}
        <CartDrawer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
