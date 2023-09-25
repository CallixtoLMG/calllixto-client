import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModTableCell = styled(Table.Cell)({
  background: "#EEEEEE!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModTableRow = styled(Table.Row)({
  cursor: "pointer!important"
});

export {
  MainContainer, ModTableCell, ModTableHeaderCell, ModTableRow
};

