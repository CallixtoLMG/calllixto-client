import { Flex } from "rebass";
import { Form, Button as SButton, Label as SLabel, TextArea as STextArea } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const Label = styled(SLabel)({
  width: "100%!important",
  margin: "0!important",
});

const Textarea = styled(STextArea)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
`;

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export { Button, ButtonsContainer, Label, Textarea };
