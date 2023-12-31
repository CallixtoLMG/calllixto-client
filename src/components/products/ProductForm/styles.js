import InputMask from 'react-input-mask';
import { Input, Dropdown as SDropdown } from "semantic-ui-react";
import styled from "styled-components";

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

const CodeInput = styled(Input)`
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

export { CodeInput, Dropdown, MaskedInput };
