import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://repsbrief.com'),
  title: {
    default: 'RepsBrief — AI Content Briefs from Real Trends',
    template: '%s | RepsBrief',
  },
  description:
    'Turn verified fitness trends into clear content briefs and source-backed ideas. Built for creators who need a sharper next post.',
  keywords: ['content brief', 'content strategy', 'AI content', 'trend analysis', 'content creator tools'],
  authors: [{ name: 'RepsBrief' }],
  creator: 'RepsBrief',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://repsbrief.com',
    title: 'RepsBrief — AI Content Briefs from Real Trends',
    description:
      'Turn verified fitness trends into clear content briefs and source-backed ideas.',
    siteName: 'RepsBrief',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RepsBrief Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RepsBrief — AI Content Briefs from Real Trends',
    description: 'Turn verified fitness trends into clear content briefs and source-backed ideas.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster theme="dark" position="bottom-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
