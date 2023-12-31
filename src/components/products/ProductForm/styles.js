import InputMask from 'react-input-mask';
import { Input} from "semantic-ui-react";
import styled from "styled-components";

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

export { CodeInput };
