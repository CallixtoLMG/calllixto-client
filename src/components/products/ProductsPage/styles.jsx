import Link from "next/link";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

const ModTableCell = styled(Table.Cell)({
  cursor: "pointer!important",
  textAlign: "center!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: "center!important"
});

const ModLink = styled(Link)({
  width: "fit-content",
});

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  };
  margin-top: 0!important;
`;

const ModTableRow = styled(Table.Row)`
  th:not(:first-child) {min-width: 200px!important}
  th:first-child { width: 50px!important };
  th:nth-child(2) {
    min-width: 100px!important;
    width: 100px!important
  };
  th:nth-child(3){min-width: 250px!important;};
  th:nth-child(4){ width: 200px!important;};
  th:last-child { width: 200px!important; };
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

export { ButtonContainer, HeaderContainer, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow };

