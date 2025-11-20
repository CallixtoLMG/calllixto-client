import { Flex } from '@/common/components/custom';
import { Icon as SIcon, Message as SMessage, MessageHeader as SMessageHeader, MessageItem as SMessageItem, MessageList as SMessageList } from "semantic-ui-react";
import styled from 'styled-components';

const Container = styled(Flex)`
  flex-direction: row;
  place-content: space-between;
`;

const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

const Message = styled(SMessage)`
  width: 100%;
`;

const MessageItem = styled(SMessageItem)`
  font-size: 13px!important;
`;

const Icon = styled(SIcon)`
  scale: 1.2!important;
  border-radius: 2px!important;
`;

const MessageList = styled(SMessageList)`
  max-height: 160px;
  overflow-y: auto;
`;

export { Container, Icon, Message, MessageHeader, MessageItem, MessageList };
