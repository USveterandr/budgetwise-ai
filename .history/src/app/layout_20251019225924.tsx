import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetWise AI - Your AI Financial Advisor",
  description: "Track, analyze, and grow your wealth with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <Navbar />
        <main>
          {children}
        </main>
        <footer className="bg-white border-t mt-12">
          <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} BudgetWise AI. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}