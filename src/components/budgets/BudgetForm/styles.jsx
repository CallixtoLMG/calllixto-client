import { Flex } from '@/common/components/custom';
import { MessageHeader as SMessageHeader, MessageItem as SMessageItem, MessageList as SMessageList } from "semantic-ui-react";
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

const MessageList = styled(SMessageList)`
  max-height: 160px;
  overflow-y: auto;
`;

const VerticalDivider = styled.div`
  height: 35px;
  width: 1px;
  background-color: #ccc;
  margin: 0 10px;
`;

export { Container, MessageHeader, MessageItem, MessageList, VerticalDivider };

