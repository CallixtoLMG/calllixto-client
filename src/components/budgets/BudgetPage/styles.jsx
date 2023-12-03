import Link from "next/link";
import { Icon, Table } from "semantic-ui-react";
import styled from "styled-components";

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  };
  margin-top: 0!important;
`;

const ModTableRow = styled(Table.Row)`
  th:not(:first-child) { min-width: 150px!important }
  th:first-child { width: 50px!important; }
  th:nth-child(3){ width: 250px!important;}
  th:nth-child(4){ width: 200px!important;}
  th:nth-child(5){ width: 150px!important;}
`;

const ModIcon = styled(Icon)({
  margin: "0!important",
});

const ModLink = styled(Link)({
  width: "fit-content",
});

export {
  ModIcon, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow
};

