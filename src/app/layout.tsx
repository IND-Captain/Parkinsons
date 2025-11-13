import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parkinson's AI - Early Detection Tool",
  description: "AI-powered voice analysis for early detection of Parkinson's disease. Free, private, and accurate screening tool.",
  keywords: ["Parkinson's", "AI", "voice analysis", "early detection", "medical screening", "neurological"],
  authors: [{ name: "Parkinson's AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Parkinson's AI - Early Detection",
    description: "AI-powered voice analysis for early Parkinson's detection",
    url: "https://parkinsons-ai.com",
    siteName: "Parkinson's AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parkinson's AI - Early Detection",
    description: "AI-powered voice analysis for early Parkinson's detection",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
