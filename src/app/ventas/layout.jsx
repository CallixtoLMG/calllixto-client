"use client";
import { MainContainer, SubContainer } from "@/commonStyles";
import 'semantic-ui-css/semantic.min.css';

export default function RootLayout({ children }) {
  return (
    <MainContainer>
      <SubContainer>
        {children}
      </SubContainer>
    </MainContainer>
  );
};