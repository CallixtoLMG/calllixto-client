import Link from "next/link";
import { Flex } from "rebass";
import { Button, Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModButtonProduct = styled(Button)({
  width: "14rem!important",
});

const ModLink = styled(Link)({
  width: "14rem!important",
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
  MainContainer, ModButtonProduct, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow
};

