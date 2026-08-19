import { Flex } from "@/common/components/custom";
import { createGlobalStyle, styled } from "styled-components";

export const ADD_BILL_POPUP_CLASS_NAME = "cash-balance-add-bill-popup";

export const AddBillPopupGlobalStyles = createGlobalStyle`
  @media (max-width: 767px) {
    .${ADD_BILL_POPUP_CLASS_NAME}.ui.popup {
      box-sizing: border-box;
      width: min(360px, calc(100vw - 32px)) !important;
      max-width: calc(100vw - 32px) !important;
    }
  }
`;

export const AddBillFields = styled(Flex)`
  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    flex-direction: column;
    row-gap: 10px;
    column-gap: 0;

    > .field {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    > button {
      align-self: flex-end;
    }
  }
`;
