import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Forkd — Group Restaurant Chooser",
  description: "Discover, shortlist, and vote on restaurants with your group. No more endless debates — let Forkd decide.",
  openGraph: {
    title: "Forkd — Group Restaurant Chooser",
    description: "Discover, shortlist, and vote on restaurants with your group.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
        {children}
      </body>
    </html>
  );
}
