import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
    'Generate high-impact weekly content briefs powered by real Reddit, YouTube, and Google trends. Built for solo creators and content studios.',
  keywords: ['content brief', 'content strategy', 'AI content', 'trend analysis', 'content creator tools'],
  authors: [{ name: 'RepsBrief' }],
  creator: 'RepsBrief',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://repsbrief.com',
    title: 'RepsBrief — AI Content Briefs from Real Trends',
    description:
      'Generate high-impact weekly content briefs powered by real Reddit, YouTube, and Google trends.',
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
    description:
      'Generate high-impact weekly content briefs powered by real Reddit, YouTube, and Google trends.',
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
      </body>
    </html>
  );
}
