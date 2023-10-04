import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModTableRow = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

export {
  MainContainer, ModTable, ModTableHeaderCell, ModTableRow
};

