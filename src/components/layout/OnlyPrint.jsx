import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    @page {
      margin-left: 0px;
      margin-right: 0px;
      margin-top: 0;
      margin-bottom: 25px;
    }

    @page :first {
      margin-top: -125px;
    }
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
