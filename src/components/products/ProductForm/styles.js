import { Flex } from "rebass";
import { Form, Button as SButton, Input as SInput, Label as SLabel, TextArea as STextArea } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const FormContainer = styled(Flex)`
  flex-direction: column;
  margin-top: 14px!important;
`;

const Label = styled(SLabel)({
  width: "100%!important"
});

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const Input = styled(SInput)`
  margin: 1rem 0!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;
`;

const WarningMessage = styled.p`
  position: relative;
  color: red!important;
  bottom: 0.5rem!important;
`;

const FormField = styled(Form.Field)`
  width: ${(props) => props.width || '200px!important'};
  max-width: 300px!important;
  min-width: 50px!important;
  flex: ${(props) => props.flex || '1!important'};
  margin: 0!important;
`;

const FieldsContainer = styled(Flex)`
  flex-direction: row!important;
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

const Textarea = styled(STextArea)`
  margin: 1rem 0!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
`;

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

export { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, HeaderContainer, Input, Label, Textarea, WarningMessage };

