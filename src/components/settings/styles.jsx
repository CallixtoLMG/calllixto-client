import { Form } from "semantic-ui-react";
import styled from "styled-components";

export const FormSelect = styled(Form.Select)`
  div.ui.selection.dropdown {
    min-width: 100px!important;
    height: 38px;
  } 
`;

export const FormInput = styled(Form.Input)`
  div.ui.input{
    height: 38px;
    align-self: flex-end;
  }
`;
