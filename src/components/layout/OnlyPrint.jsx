import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    @page {
      margin-bottom: 30px;
      margin-top: 30px;
    }
    @page :first {
      margin-top: 0px;
      margin-bottom: 30px;
    }
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
