import styled from "styled-components";
import { FieldsContainer } from "../../custom";

const MOBILE_BREAKPOINT = "767px";
const MOBILE_POPUP_CONTENT_WIDTH = "min(520px, calc(100vw - 64px))";

export const ContactPopupFields = styled(FieldsContainer)`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: ${MOBILE_POPUP_CONTENT_WIDTH} !important;
    max-width: calc(100vw - 64px) !important;
    min-width: 0 !important;
  }
`;
