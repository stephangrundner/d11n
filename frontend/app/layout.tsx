import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'd11n',
  description: 'Collaborative documentation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppLayout>{children}</AppLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
