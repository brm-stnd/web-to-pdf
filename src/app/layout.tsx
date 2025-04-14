import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web to PDF',
  description: 'Generate PDF from URL using Puppeteer & Browserless',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}