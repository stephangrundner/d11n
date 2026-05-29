import { DocumentContextProvider } from '@/contexts/DocumentContext';
import { MenuBar } from '@/components/MenuBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocumentContextProvider>
      <MenuBar />
      {children}
    </DocumentContextProvider>
  );
}
