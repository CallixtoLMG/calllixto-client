import styled from "styled-components";

const NoPrintContainer = styled.div`
  @media print {
    display: none;
  }
`;

const NoPrint = ({ children }) => {
  return <NoPrintContainer>{children}</NoPrintContainer>
};

export default NoPrint;