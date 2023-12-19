import styled from "styled-components";

const OnlyPrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
  }
`;

const OnlyPrint = ({ children }) => {
    return <OnlyPrintContainer>{children}</OnlyPrintContainer>
};

export default OnlyPrint;