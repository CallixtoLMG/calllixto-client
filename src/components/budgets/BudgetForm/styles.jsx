import { Flex } from "rebass";
import { Button, Dropdown, Input, Table } from 'semantic-ui-react';
import styled from 'styled-components';

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModInput = styled(Input)`
  input {
    text-align: center!important;
  };
`;

const ModButton = styled(Button)({
  width: "170px!important",
  padding: "10px 0!important",
});

const TotalText = styled.h3`
  margin-left: 2rem;
`;

const ModDropdown = styled(Dropdown)({
  width: "20rem!important",
  display: "flex!important",
  marginBottom: "14px!important",
});

const ModTableRow = styled(Table.Row)`
  th{ min-width: 8rem!important; };
  th:first-child { min-width: 20rem!important; };
  th:nth-child(6) { min-width: 10rem!important; };
  th:not(:first-child) { width: 12rem!important; };
`;

export { MainContainer, ModButton, ModDropdown, ModInput, ModTableRow, TotalText };

