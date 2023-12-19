import Link from "next/link";
import { Flex } from "rebass";
import { Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const Cell = styled(STable.Cell)({
  cursor: "pointer!important",
  textAlign: "center!important"
});

const TableHeader = styled(STable.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: "center!important"
});

const Row = styled(STable.Row)`
  th:not(:first-child) { min-width: 200px!important; }
  th:nth-child(3){ min-width: 150px!important; }
  th:first-child { width: 50px!important };
  th:last-child { width: 200px!important; };
`;

const Table = styled(STable)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  };
  margin-top: 0!important;
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

export { ButtonContainer, HeaderContainer, ModLink, Table, Cell, TableHeader, Row };

