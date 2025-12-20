import './globals.css';

export const metadata = {
  title: 'Gentle Nudge',
  description:
    'A gentle way to change your phone habits. Tap a familiar icon and open the apps you actually want to use, with probabilities you can increase over time.',
  metadataBase: new URL('https://gentlenudge.dev'),
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Gentle Nudge',
    description:
      'Tap a familiar icon. Open the apps you actually want to use. Tune the probabilities over time.',
    url: 'https://gentlenudge.dev',
    siteName: 'Gentle Nudge',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gentle Nudge',
    description:
      'Tap a familiar icon. Open the apps you actually want to use. Tune the probabilities over time.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


