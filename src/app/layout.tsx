import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ammar-bin-yasir.vercel.app'),
  title: 'Ammar Bin Yasir — AI Automation Engineer',
  description: 'AI Automation Engineer building intelligent agents, connected workflows, and production-ready full-stack products.',
  openGraph: {
    title: 'Ammar Bin Yasir — AI Automation Engineer',
    description: 'Intelligent systems built to think, flow, and ship.',
    url: '/', type: 'website', siteName: 'Ammar Bin Yasir',
  },
  twitter: { card: 'summary_large_image', title: 'Ammar Bin Yasir — AI Automation Engineer', description: 'Intelligent systems built to think, flow, and ship.' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#0a0a09', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
