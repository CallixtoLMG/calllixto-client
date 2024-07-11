import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    @page {
      margin-top: ${({ marginTop = "30px" }) => marginTop};
      margin-bottom: 25px;
      margin-left: 30px;
      margin-right: 30px;
    }
  }
`;

export const OnlyPrint = ({ children, marginTop }) => {
  return <OnlyPrintContainer marginTop={marginTop}>{children}</OnlyPrintContainer>
};
