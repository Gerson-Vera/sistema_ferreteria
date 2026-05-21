import type { Metadata } from 'next';
import { Geist, JetBrains_Mono, Barlow_Condensed } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
});

export const metadata: Metadata = {
  title: 'Sistema Ferretería',
  description: 'Sistema de gestión para ferretería',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}>
      <body style={{ fontFamily: 'var(--font-geist, "Geist", Inter, Helvetica, Arial, sans-serif)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
