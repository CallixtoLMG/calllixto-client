import styled from "styled-components";

export const AnimatedContent = styled.div`
  display: grid;
  grid-template-rows: ${({ $active }) => ($active ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease!important;
`;

export const AnimatedInner = styled.div`
  overflow: ${({ $active }) => ($active ? "visible" : "hidden")};
`;