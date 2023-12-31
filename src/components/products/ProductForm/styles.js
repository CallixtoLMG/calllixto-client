import InputMask from 'react-input-mask';
import { Flex } from "rebass";
import { Form, Button as SButton, Dropdown as SDropdown, TextArea as STextArea } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const Dropdown = styled(SDropdown)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15)!important;
  border-radius: 0.28571429rem!important;
  height: 50px!important;
  display: flex!important;
  flex-wrap: wrap;
  align-content: center;
    input {
     height: 50px!important;
    };
    i.dropdown.icon {
      top:15px!important;
    };
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
      };
  };
`;

const CodeInput = styled(SInput)`
position: absolute!important;
  top: 9.79rem!important;
  left: 1rem!important;
  margin: 0!important;
  border-radius: 0.28571429rem;
  height: 40px!important;
  width: 42px!important;
  z-index: 1!important;

  input{
    border: none!important;
    padding: 0!important;
  };
`;

const WarningMessage = styled.p`
  position: relative;
  color: red!important;
  bottom: 0.5rem!important;
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

export { Button, ButtonsContainer, CodeInput, Dropdown, MaskedInput, Textarea, WarningMessage };

