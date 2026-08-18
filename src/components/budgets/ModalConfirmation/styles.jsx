import { Flex as BaseFlex } from "@/common/components/custom";
import { Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const MOBILE_BREAKPOINT = "767px";

export const HeaderContent = styled(BaseFlex)`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    flex-direction: column !important;
    align-items: stretch !important;
    row-gap: 10px;

    .ui.buttons {
      display: flex;
      width: 100%;
    }

    .ui.buttons > .button {
      flex: 1 1 0 !important;
      width: auto !important;
      min-width: 0 !important;
    }
  }
`;

export const ModalContent = styled(SModal.Content)`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    max-height: calc(100vh - 210px);
    overflow-y: auto;

    && .ui.segment {
      padding: 14px !important;
    }
  }
`;
