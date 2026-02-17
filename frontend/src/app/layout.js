import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NutraLingo — Your food label, decoded in your language",
  description: "AI-powered food label scanner that extracts ingredients, analyzes health impact, and explains everything in your native language using Lingo.dev.",
  manifest: "/manifest.json",
  themeColor: "#0A0F1C",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0A0F1C" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
