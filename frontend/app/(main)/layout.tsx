import { DocumentContextProvider } from '@/contexts/DocumentContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { MenuBar } from '@/components/MenuBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DocumentContextProvider>
        <MenuBar />
        {children}
      </DocumentContextProvider>
    </NotificationProvider>
  );
}
