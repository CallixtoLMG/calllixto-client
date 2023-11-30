"use client";
import Footer from "@/components/Footer";
import Header from "@/components/layout/Header";
import Toaster from "@/components/layout/Toaster";
import { Inter } from 'next/font/google';
import 'semantic-ui-css/semantic.min.css';
import StyledComponentsRegistry from './registry';
import {
  LayoutChildrenContainer
} from "./stylesLayout";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

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
          <LayoutChildrenContainer >
            {children}
          </LayoutChildrenContainer>
          <Footer />
        </body>
      </StyledComponentsRegistry>
    </html>
  )
}