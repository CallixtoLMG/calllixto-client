import { Table } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(Table.Cell)`
  text-align: center!important;
`;

const HeaderCell = styled(Table.HeaderCell)`
  background-color: #EEEEEE!important;
  text-align: center!important;
`;

const LinkRow = styled(Table.Row)`
  cursor: pointer;
`;

export { HeaderCell, Cell, LinkRow };

