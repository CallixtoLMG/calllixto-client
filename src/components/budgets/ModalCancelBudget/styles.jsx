import { Modal, Message as SMessage } from "semantic-ui-react";
import styled from "styled-components";

const ModalContent = styled(Modal.Content)`
  padding: 5px 0!important;
`;

const Message = styled(SMessage)`
  border-radius: 0px!important;
  width: 100%;
`;

export { Message, ModalContent };

