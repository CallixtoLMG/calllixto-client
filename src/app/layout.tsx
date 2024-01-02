"use client";
// import { Footer } from "@/components/layout";
import { GoBackButton } from "@/components/common/buttons";
import { Breadcrumb, Header, NoPrint, Toaster } from "@/components/layout";
import { Inter } from 'next/font/google';
import 'semantic-ui-css/semantic.min.css';
import StyledComponentsRegistry from './registry';
import {
  LayoutChildrenContainer
} from "./stylesLayout";
import { BreadcrumProvider } from '@/components/layout';
import styled from "styled-components";

const inter = Inter({ subsets: ['latin'] });

const NavigationContainer = styled.div`
  position: fixed;
  top: 60px;
  padding: 10px 15px;
  display: flex;
  z-index: 2;
  align-items: center;
  column-gap: 20px;
  background-color: #fff;
  width: 100%;
  border-bottom: 1px solid #ddd;
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <BreadcrumProvider>
            <NoPrint>
              <NavigationContainer>
                <GoBackButton />
                <Breadcrumb />
              </NavigationContainer>
            </NoPrint>
            <LayoutChildrenContainer>
              {children}
            </LayoutChildrenContainer>
          </BreadcrumProvider>
          {/* <Footer /> */}
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};