import { Button, Dropdown, Input } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledInput = styled(Input)`
  input {
    text-align: center!important;
  }
`;

const ModButtonProduct = styled(Button)({
  marginTop: "14px!important",
  width: "14rem!important"
})

const ModButtonBudget = styled(Button)({
  width: "14rem!important"
})

const ModDropdown = styled(Dropdown)({
  width: "20rem!important",
  display:"flex!important",
  // overflow:"hidden!important",
  // textOverflow: "ellipsis!important"
})

export { ModButtonBudget, ModButtonProduct, ModDropdown, StyledInput };

