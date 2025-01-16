import { MessageHeader as SMessageHeader, MessageItem as SMessageItem } from "semantic-ui-react";
import styled from 'styled-components';

const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

const MessageItem = styled(SMessageItem)`
  font-size: 13px!important;
`;

export {
  MessageHeader,
  MessageItem
};
