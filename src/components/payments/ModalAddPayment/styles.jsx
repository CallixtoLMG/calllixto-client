import { Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const MOBILE_BREAKPOINT = "767px";

export const ModalContent = styled(SModal.Content)`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }
`;
