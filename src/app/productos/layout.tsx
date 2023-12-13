"use client";
import 'semantic-ui-css/semantic.min.css';
import { MainContainer, SubContainer } from "../../commonStyles";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <MainContainer>
      <SubContainer>
        {children}
      </SubContainer>
    </MainContainer>
  );
};