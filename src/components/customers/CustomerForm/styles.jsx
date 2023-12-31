import InputMask from 'react-input-mask';
import { Flex } from "rebass";
import { Button as SButton, TextArea as STextArea } from "semantic-ui-react";
import styled from "styled-components";

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

const ButtonsContainer = styled(Flex)`
  align-self: flex-end;
  column-gap: 20px;
`;

const PhoneContainer = styled(Flex)`
  column-gap: 10px;
`;

export { Button, ButtonsContainer, MaskedInput, PhoneContainer, Textarea };

