import { Button, Dropdown, Input, Table } from 'semantic-ui-react';
import styled from 'styled-components';

const ModInput = styled(Input)`
  input {
    text-align: center!important;
  }
`;

const ModButtonProduct = styled(Button)({
  marginTop: "14px!important",
  width: "14rem!important"
});

const ModButtonBudget = styled(Button)({
  width: "14rem!important"
});

const TotalText = styled.h3`
  margin-left: 2rem;
`;

const ModDropdown = styled(Dropdown)({
  width: "20rem!important",
  display: "flex!important",
});

const ModTableRow = styled(Table.Row)`
  th:first-child {
    min-width: 20rem!important;
  };

  th:not(:first-child) {
    width: 12rem!important;
  };
`;

export { ModButtonBudget, ModButtonProduct, ModDropdown, ModInput, ModTableRow, TotalText };

