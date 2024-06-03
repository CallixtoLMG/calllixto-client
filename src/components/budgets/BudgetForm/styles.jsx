import { Flex } from "rebass";
import { Icon as SIcon, MessageHeader as SMessageHeader, MessageItem as SMessageItem, MessageList as SMessageList } from "semantic-ui-react";
import styled from 'styled-components';

const Container = styled(Flex)`
  flex-direction: row;
  place-content: space-between;
`;

const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

const MessageItem = styled(SMessageItem)`
  font-size: 13px!important;
`;

const Icon = styled(SIcon)`
  scale: 1.2!important;
  border-radius: 2px!important;
  &:hover {
    background: #e8e8e8!important;
  }
`;
const MessageList = styled(SMessageList)`
  max-height: 160px;
  overflow-y: auto;
`;

export { Container, Icon, MessageHeader, MessageItem, MessageList };

