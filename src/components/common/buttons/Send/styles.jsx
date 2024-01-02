import { Flex } from "rebass";
import { Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const ModalContainer = styled(Flex)`
  flex-direction: row;
`;

const Button = styled(SButton)({
  width: "170px!important",
  padding: "10px 0!important",
});

const MailButton = styled(SButton)`
  background-color: ${(props) => props.background || 'inherit'};
  color: white!important;
`;

const ButtonContainer = styled(Flex)`
  width: 180px!important;
  padding: 0!important;
  margin-left: 14px!important;
  height: 34px!important;
`;

export { ButtonContainer, MailButton, Button, ModalContainer };
