import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    @page {
      margin-top: 30px;
      margin-bottom: 25px;
      margin-left: 30px;
      margin-right: 30px;
    }
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
