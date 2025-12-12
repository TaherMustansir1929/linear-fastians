import { DomainRestrictor } from "@/components/DomainRestrictor";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Linear",
  description: "Linear - an online study documents sharing platform",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        </head>
        <body className={`${jetbrainsMono.variable} antialiased`}>
          <Providers>
            <DomainRestrictor />
            {children}
            <Toaster />
            <Analytics />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
