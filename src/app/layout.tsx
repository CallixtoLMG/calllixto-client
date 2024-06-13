"use client";
import { UserProvider } from "@/User";
import { GoBackButton } from "@/components/common/buttons";
import { PaginationProvider } from "@/components/common/table/Pagination";
import { BreadcrumProvider, Breadcrumb, Header, NavActions, NavActionsProvider, NoPrint, Toaster } from "@/components/layout";
import { PAGES } from "@/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter } from 'next/font/google';
import { usePathname } from "next/navigation";
import { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import styled from "styled-components";
import StyledComponentsRegistry from './registry';
import {
  LayoutChildrenContainer
} from "./stylesLayout";

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
  const notShow = [PAGES.LOGIN.BASE, PAGES.BASE, PAGES.NOT_FOUND.BASE];
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
      <StyledComponentsRegistry>
        <body className={inter.className}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000
            }} />
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <PaginationProvider>
                <Header />
                <NavActionsProvider>
                  <BreadcrumProvider>
                    {show && (
                      <NoPrint>
                        <NavigationContainer>
                          <BreadcrumbContainer>
                            <GoBackButton />
                            <Breadcrumb />
                          </BreadcrumbContainer>
                          <NavActions />
                        </NavigationContainer>
                      </NoPrint>
                    )}
                    <LayoutChildrenContainer>
                      {children}
                    </LayoutChildrenContainer>
                  </BreadcrumProvider>
                </NavActionsProvider>
              </PaginationProvider>
            </UserProvider>
          </QueryClientProvider>
          {/* <Footer /> */}
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};