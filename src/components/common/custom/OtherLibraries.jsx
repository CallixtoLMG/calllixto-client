import InputMask from 'react-input-mask';
import styled from "styled-components";

export const MaskedInput = styled(InputMask)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15)!important;
  border-radius: 0.28571429rem;
  height: 50px!important;

  > input {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      };
  };
`;