import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
  }
`;

export const OnlyPrint = ({ children }) => {
  return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};
