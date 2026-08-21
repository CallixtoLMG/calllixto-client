import { Modal } from "@/common/components/custom";
import styled from "styled-components";

const MOBILE_BREAKPOINT = "767px";

const UnsavedModal = styled(Modal)`
  &&&& {
    .header {
      position: relative;
      padding-right: 48px !important;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
      .header {
        padding: 16px 48px 14px 16px !important;
      }

      .content {
        padding: 14px 16px !important;
      }

      .actions > div {
        max-width: 100%;
        flex-wrap: wrap;
        row-gap: 10px;
      }
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.06);
    color: rgba(0, 0, 0, 0.85);
    outline: none;
  }

  i.icon {
    margin: 0 !important;
  }
`;

export { CloseButton, UnsavedModal };
