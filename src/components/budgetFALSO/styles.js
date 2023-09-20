import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 70px 30px 30px 30px!important;
  flex-direction: column;
`;

const SearchBarContainer = styled(Flex)`
  margin:100px 0 0 35px!important;
`;

const ModTableCell = styled(Table.Cell)({
  background: "#EEEEEE!important"
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

export {
  MainContainer, ModTableCell, ModTableHeaderCell, SearchBarContainer
};

