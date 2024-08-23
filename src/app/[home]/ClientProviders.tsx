'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Provider } from 'react-redux';

import { store } from '@/redux/store';

type ClientProvidersProps = {
  children: React.ReactNode;
  locale: string;
};

export default function ClientProviders({ children, locale }: ClientProvidersProps) {
  const messages = useMessages();

  return (
    <Provider store={store}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </Provider>
  );
}
