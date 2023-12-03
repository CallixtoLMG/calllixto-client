"use client";
import PageHeader from "@/components/layout/PageHeader";
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
        <PageHeader title={"Presupuestos"} />
        {children}
      </SubContainer>
    </MainContainer>
  );
};