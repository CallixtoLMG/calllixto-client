import Link from "next/link";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
  max-width: 120vh!important;
`;

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important"
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
  th:not(:first-child) { min-width: 150px!important }
  th:first-child { width: 50px!important; }
  th:nth-child(3){ width: 250px!important;}
  th:nth-child(4){ width: 200px!important;}
  th:nth-child(5){ width: 150px!important;}
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

export {
  MainContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow
};

