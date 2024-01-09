import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    @page {
      margin-left: -40px;
      margin-right: -40px;
      margin-top: 0;
      margin-bottom: 0;
    }

    @page :first {
      margin-top: -125px;
    }
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
