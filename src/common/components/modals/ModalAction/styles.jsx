import { Modal, Message as SMessage } from "semantic-ui-react";
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

const ModalContent = styled(Modal.Content)`
  padding: 5px 0!important;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 14px 16px !important;
  }
`;

const Message = styled(SMessage)`
  border-radius: 0px!important;
`;

export { Form, Message, ModalContent };

