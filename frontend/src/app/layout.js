import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NutraLingo — Your food label, decoded in your language",
  description: "AI-powered food label scanner that extracts ingredients, analyzes health impact, and explains everything in your native language using Lingo.dev.",
  manifest: "/manifest.json",
  themeColor: "#ECFDF5",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutraLingo",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
