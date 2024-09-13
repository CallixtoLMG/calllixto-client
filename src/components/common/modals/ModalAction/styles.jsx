import { Modal, Message as SMessage } from "semantic-ui-react";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 15px;
`;

const ModalContent = styled(Modal.Content)`
  padding: 5px 0!important;
`;

const Message = styled(SMessage)`
  border-radius: 0px!important;
`;

export { Form, Message, ModalContent };

