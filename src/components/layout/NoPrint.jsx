import styled from "styled-components";

const NoPrintContainer = styled.div`
  @media print {
    display: none;
  }
`;

export const NoPrint = ({ children }) => {
  return <NoPrintContainer>{children}</NoPrintContainer>
};
