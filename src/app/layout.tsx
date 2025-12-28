import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AuthSync } from '@/components/providers/AuthSync';
import { NavBar } from '@/components/layout/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'CTO Vineyard - Meme Gallery',
  description: 'Browse and download CTO memes',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <SessionProvider>
            <AuthSync>
              <NavBar />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a1a1a',
                    color: '#FAFAFA',
                    border: '1px solid #262626',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#FAFAFA',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#FAFAFA',
                    },
                  },
                }}
              />
            </AuthSync>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

