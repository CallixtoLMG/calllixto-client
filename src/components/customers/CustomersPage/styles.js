import Link from "next/link";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important",
  textAlign: "center!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: "center!important"
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
  };
  margin-top: 0!important;
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

export {
  ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow
};

