import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
 
    @page {
      margin-top: ${({ marginTop = "30px" }) => marginTop && marginTop};
      margin-bottom: 25px;
      margin-left: 30px;
      margin-right: 30px;
    }

    @page :first {
      margin-top: ${({ firstPageMarginTop = "30px" }) => firstPageMarginTop && firstPageMarginTop};
      margin-bottom: 25px;
      margin-left: 30px;
      margin-right: 30px;
    }
  }
`;

export const OnlyPrint = ({ children, marginTop, firstPageMarginTop }) => {
  return <OnlyPrintContainer marginTop={marginTop} firstPageMarginTop={firstPageMarginTop}>{children}</OnlyPrintContainer>
};
