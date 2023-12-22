import { Table } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(Table.Cell)({
  cursor: "pointer!important",
  textAlign: "center!important"
});

const HeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important",
  textAlign: "center!important"
});

export { HeaderCell, Cell };

