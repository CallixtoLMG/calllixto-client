import { Flex } from "@/common/components/custom";
import styled from "styled-components";

export const AnimatedContent = styled.div`
  display: grid;
  grid-template-rows: ${({ $active }) => ($active ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease!important;
`;

export const AnimatedInner = styled.div`
  min-width: 0;
  max-width: 100%;
  overflow: ${({ $active }) => ($active ? "visible" : "hidden")};
`;

export const Span = styled.span`
  font-weight: 700;
`

export const SettingsAddRow = styled(Flex)`
  @media (max-width: 767px) {
    flex-direction: column;
    row-gap: 15px;
    column-gap: 0;
    min-width: 0;

    > .field {
      width: 100% !important;
      max-width: 100%;
      min-width: 0 !important;
    }

    > .ui.button {
      align-self: flex-end;
      margin-top: 0 !important;
    }
  }
`;
