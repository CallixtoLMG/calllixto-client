import InputMask from 'react-input-mask';
import { Flex } from "rebass";
import { Form, Button as SButton, Input as SInput, Label as SLabel, TextArea as STextArea } from "semantic-ui-react";
import styled from "styled-components";

const Label = styled(SLabel)`
  width: 100%!important;
  margin: 0!important;
`;

const MaskedInput = styled(InputMask)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;

  > input {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
  };
`;

const Input = styled(SInput)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;
  > input {
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
   };
`;

const FormContainer = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
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

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const FieldsContainer = styled(Flex)`
  justify-content: ${(props) => props.jContent || "normal"};
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
  justify-content: space-between;
`;

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

const PhoneContainer = styled(Flex)`
  column-gap: 10px;
`;

export { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, MaskedInput, PhoneContainer, Textarea };

