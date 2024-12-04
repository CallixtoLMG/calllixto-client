import { Form as SForm } from "semantic-ui-react";
import styled from "styled-components";

export const FormSelect = styled(SForm.Select)`
  div.ui.selection.dropdown {
    min-width: 100px!important;
    height: 38px;
  } 
`;

export const FormInput = styled(SForm.Input)`
  div.ui.input{
    height: 38px;
    align-self: flex-end;
  }
`;

export const Form = styled(SForm)`
  &&& { 
    .field {
      margin-bottom: 0.7rem;
      position: relative !important;
    }

    label {
      position: absolute !important;
      top: -1.4rem !important;
    }
  }
`;
