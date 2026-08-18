import { Modal as SModal, Tab as STab } from "semantic-ui-react";
import styled from "styled-components";

export const ModalContent = styled(SModal.Content)`
  min-height: min(620px, calc(100vh - 190px));
  max-height: calc(100vh - 190px);
  overflow: hidden;
`;

export const Tab = styled(STab)`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .menu {
    flex: 0 0 auto;
  }

  > .segment {
    flex: 1 1 auto;
    overflow-y: auto;
  }
`;
