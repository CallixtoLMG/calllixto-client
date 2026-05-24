"use client";
import { Toaster } from "@/components/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter } from 'next/font/google';
import { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import StyledComponentsRegistry from './registry';
import { GlobalStyle } from "./stylesLayout";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <GlobalStyle />
      <StyledComponentsRegistry>
        <body className={inter.className}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000
            }} />
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};
