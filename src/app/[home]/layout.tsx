import '@/styles/global.css';

import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import BottomMenu from '@/components/BottomMenu'; // Added import
import SearchBar from '@/components/SearchBar'; // Added import
import { AppConfig } from '@/utils/AppConfig';

import ReduxProvider from './ReduxProvider';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return AppConfig.locales.map(locale => ({ locale }));
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body className="flex h-screen flex-col bg-pantip-purple-light pt-12">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <SearchBar />
            {children}
            <section className="px-24">
              <BottomMenu />
            </section>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
