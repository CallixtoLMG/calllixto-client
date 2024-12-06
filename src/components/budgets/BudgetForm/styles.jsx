import { Flex } from '@/components/common/custom';
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
  border-radius: 2px!important;
  position: ${({ positionRelative }) => positionRelative && "relative"} !important;
  top:${({ positionRelative }) => positionRelative && "-0.15em"} !important;
`;

const MessageList = styled(SMessageList)`
  max-height: 160px;
  overflow-y: auto;
`;

const VerticalDivider = styled.div`
  height: 30px;
  width: 1px;
  background-color: #ccc;
  margin: 0 10px;
`;

export { Container, Icon, MessageHeader, MessageItem, MessageList, VerticalDivider };

