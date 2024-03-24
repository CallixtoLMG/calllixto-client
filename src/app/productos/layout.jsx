"use client";
import { MainContainer, SubContainer } from "@/commonStyles";
import { PaginationProvider } from '@/components/common/table/Pagination';
import 'semantic-ui-css/semantic.min.css';

export default function RootLayout({ children }) {
  return (
    <PaginationProvider>
      <MainContainer>
        <SubContainer>
          {children}
        </SubContainer>
      </MainContainer>
    </PaginationProvider>
  );
};