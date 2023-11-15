import Link from "next/link";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  justify-content: center!important;
  width: 100%!important;
`;

const SubContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
  width: 80%!important;
  max-width: 900px!important;
`;

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModTableRow = styled(Table.Row)`
  th:not(:first-child) { min-width: 200px!important; }
  th:nth-child(3){ min-width: 150px!important; }
  th:first-child { width: 50px!important };
  th:last-child { width: 200px!important; };
`;

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

export {
  MainContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, SubContainer
};

