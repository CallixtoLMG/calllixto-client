import Link from "next/link";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const Cell = styled(Table.Cell)({
  cursor: "pointer!important",
  textAlign: "center!important"
});

const HeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: "center!important"
});

const ModLink = styled(Link)({
  width: "fit-content",
});

export { ButtonContainer, HeaderContainer, ModLink, Cell, HeaderCell };

