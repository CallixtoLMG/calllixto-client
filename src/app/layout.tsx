"use client";
import { UserProvider } from "@/User";
import { GoBackButton } from "@/components/common/buttons";
import { BreadcrumProvider, Breadcrumb, Header, NavActions, NavActionsProvider, Toaster } from "@/components/layout";
import { PAGES } from "@/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter } from 'next/font/google';
import { usePathname } from "next/navigation";
import { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import styled from "styled-components";
import StyledComponentsRegistry from './registry';
import { GlobalStyle, LayoutChildrenContainer } from "./stylesLayout";

const inter = Inter({ subsets: ['latin'] });

const NavigationContainer = styled.div`
  position: fixed;
  top: 60px;
  padding: 10px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 20px;
  background-color: #fff;
  width: 100%;
  border-bottom: 1px solid #ddd;
  z-index: 2;
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 20px;
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOT_FOUND.BASE, PAGES.CHANGE_PASSWORD.BASE, PAGES.RESTORE_PASSWORD.BASE];
  const show = !notShow.includes(pathname);

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
            <UserProvider>
              <Header />
              <NavActionsProvider>
                <BreadcrumProvider>
                  {show && (
                    <NavigationContainer>
                      <BreadcrumbContainer>
                        <GoBackButton />
                        <Breadcrumb />
                      </BreadcrumbContainer>
                      <NavActions />
                    </NavigationContainer>
                  )}
                  <LayoutChildrenContainer>
                    {children}
                  </LayoutChildrenContainer>
                </BreadcrumProvider>
              </NavActionsProvider>
            </UserProvider>
          </QueryClientProvider>
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};