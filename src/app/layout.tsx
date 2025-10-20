// file: src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sevillana, Courgette, Belgrano, Niconne } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "./providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sevillana = Sevillana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sevillana',
});

const courgette = Courgette({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-courgette',
});

const belgrano = Belgrano({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-belgrano',
});

const niconne = Niconne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-niconne',
});

export const metadata: Metadata = {
  title: "FoxFund - Budget Tracker",
  description: "Track your expenses and manage your budget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sevillana.variable} ${courgette.variable} ${belgrano.variable} ${niconne.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}   