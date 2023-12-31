import { Flex } from "rebass";
import { Form, Button as SButton, Input as SInput, Label as SLabel, TextArea as STextArea } from "semantic-ui-react";
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

const Input = styled(SInput)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;
`;
const FormField = styled(Form.Field)`
  width: ${(props) => props.width || '200px!important'};
  min-width: ${(props) => props.minWidth || "200px!important"};
  flex: ${(props) => props.flex || 'none!important'};
  margin: 0!important;
  flex-direction: column;
`;

const Textarea = styled(STextArea)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
`;

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export { Button, ButtonsContainer, FormField, Input, Label, Textarea };

