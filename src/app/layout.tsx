"use client";
// import { Footer } from "@/components/layout";
import { GoBackButton } from "@/components/common/buttons";
import { Header, Toaster } from "@/components/layout";
import { Inter } from 'next/font/google';
import 'semantic-ui-css/semantic.min.css';
import StyledComponentsRegistry from './registry';
import {
  LayoutChildrenContainer
} from "./stylesLayout";

const inter = Inter({ subsets: ['latin'] });

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
          <GoBackButton />
          <LayoutChildrenContainer >
            {children}
          </LayoutChildrenContainer>
          {/* <Footer /> */}
        </body>
      </StyledComponentsRegistry>
    </html>
  );
};