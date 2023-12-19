import { Flex } from "rebass";
import { Button as SButton, Form, Input as SInput, Label as SLabel } from "semantic-ui-react";
import styled from "styled-components";

const Label = styled(SLabel)`
  width: 100%!important;
`;

const Input = styled(SInput)`
  margin: 8px 0!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;

  > input  {
    padding: 1em 1em!important;
  };
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const FormContainer = styled(Flex)`
  flex-direction: column;
`;

const FormField = styled(Form.Field)`
  width: ${(props) => props.width || '200px'} !important;
  flex: 1;
`;

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const FieldsContainer = styled(Flex)`
  justify-content: space-between;
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

const PhoneContainer = styled(Flex)`
  column-gap: 10px;
`;

export { FormContainer, HeaderContainer, Button, FormField, Input, Label, ButtonsContainer, FieldsContainer, PhoneContainer };

