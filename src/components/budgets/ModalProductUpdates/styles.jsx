import { MessageHeader as SMessageHeader, MessageItem as SMessageItem, Modal as SModal } from "semantic-ui-react";
import styled from 'styled-components';

const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

const ModalDescription = styled(SModal.Description)`
  padding:  1rem 1.5rem 0 1.5rem; 
  font-size: 12px!important;
  color: grey;
`;

const ModalContent = styled(SModal.Content)`
  padding: 1rem 1.5rem!important; 
`;

const MessageItem = styled(SMessageItem)`
  font-size: 13px!important;
`;

export {
  MessageHeader,
  MessageItem,
  ModalContent,
  ModalDescription
};

