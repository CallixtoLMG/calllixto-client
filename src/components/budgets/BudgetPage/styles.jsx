import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 30px 30px 30px 30px!important;
  flex-direction: column;
`;

const SearchBarContainer = styled(Flex)`
  margin:100px 0 0 35px!important;
  justify-content: space-around;
`;

const ModTableCell = styled(Table.Cell)({
  background: "#EEEEEE!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModTableRow = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;

export {
  MainContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, SearchBarContainer
};

