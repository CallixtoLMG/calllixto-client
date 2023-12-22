import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
      @page {
        margin-left: 0.5in;
        margin-right: 0.5in;
        margin-top: 0;
        margin-bottom: 0;
    }
  }
`;

export const OnlyPrint = ({ children }) => {
    return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
