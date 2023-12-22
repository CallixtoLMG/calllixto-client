import Link from "next/link";
import { Flex } from "rebass";
import { Icon, Table } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(Table.Cell)`
  cursor: pointer!important;
  text-align: center!important;
`;

const HeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: 'center!important'
});

const Row = styled(Table.Row)`
  height: 45px!important;
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

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

export { ButtonContainer, ModIcon, ModLink, Cell, HeaderCell, Row };

