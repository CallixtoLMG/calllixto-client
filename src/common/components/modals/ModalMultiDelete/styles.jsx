import { Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const MOBILE_BREAKPOINT = "767px";

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 15px;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    min-width: 0;
    flex-direction: column;
    align-items: stretch;
    row-gap: 12px;
    column-gap: 0;

    > .field {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    > :not(.field) {
      max-width: 100%;
      align-self: flex-end;
      flex-wrap: wrap;
      row-gap: 10px;
    }
  }
`;

const ModalContent = styled(SModal.Content)`
  max-height: 70vh;
  overflow: auto;
`;

const Modal = styled(SModal)`
  width: 100%!important;
  max-width: 80%!important;
  max-height: 90vh!important;
  z-index: 2000!important;
`;

export { Form, Modal, ModalContent };

