import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { HeartbeatProvider } from '@/contexts/HeartbeatContext';
import { BackendOfflineOverlay } from '@/components/BackendOfflineOverlay';

export const metadata: Metadata = {
  title: 'd11n',
  description: 'Collaborative documentation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <HeartbeatProvider>
            <BackendOfflineOverlay />
            {children}
          </HeartbeatProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
