import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';
import ThemeSwitch from '../components/ThemeSwitch';
import CLogoutButton from '../components/CLogout';
import { Toaster } from 'sonner';
import NavBar from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Q&A for your community',
  description: 'Q&A for your community, people can post questions and answers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <NavBar />
          <Toaster position="top-right" richColors />

          {children}
        </Providers>
      </body>
    </html>
  );
}
