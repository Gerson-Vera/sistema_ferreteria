import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="es" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter, Inter, Roboto, Helvetica, Arial, sans-serif)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
