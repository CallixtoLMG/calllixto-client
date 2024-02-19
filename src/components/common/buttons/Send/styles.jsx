import { Flex } from "rebass";
import { Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const Container = styled(Flex)`
  flex-direction: row;
`;

const MailButton = styled(SButton)`
  background-color: ${(props) => props.background || 'inherit'};
  color: white!important;
`;

const ButtonContainer = styled(Flex)`
  padding: 0!important;
  height: 36px!important;
`;

export { ButtonContainer, Container, MailButton };

