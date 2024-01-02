import InputMask from 'react-input-mask';
import { Flex } from "rebass";
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

const PhoneContainer = styled(Flex)`
  column-gap: 10px;
`;

export { MaskedInput, PhoneContainer };
