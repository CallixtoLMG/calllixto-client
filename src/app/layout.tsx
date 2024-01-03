"use client";
// import { Footer } from "@/components/layout";
import { GoBackButton } from "@/components/common/buttons";
import { Breadcrumb, Header, NoPrint, Toaster, NavActions } from "@/components/layout";
import { Inter } from 'next/font/google';
import 'semantic-ui-css/semantic.min.css';
import StyledComponentsRegistry from './registry';
import {
  LayoutChildrenContainer
} from "./stylesLayout";
import { BreadcrumProvider } from '@/components/layout';
import { NavActionsProvider } from '@/components/layout';
import styled from "styled-components";
import { PAGES } from "@/constants";
import { usePathname } from "next/navigation";

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

  return (
    <html lang="en">
      <StyledComponentsRegistry>
        <body className={inter.className}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000
            }} />
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
          {/* <Footer /> */}
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};