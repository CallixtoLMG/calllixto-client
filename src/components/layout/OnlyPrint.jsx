import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;

    @page {
      margin-bottom: 60px;
      margin-top: 60px;

      &:first {
        margin-top: 0;
      }
    }
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
