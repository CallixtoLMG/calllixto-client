import { Flex } from "rebass";
import { Button, GridColumn, Label, Segment, Table } from "semantic-ui-react";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  flex-direction: row;
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: 200px!important;
`;

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModButton = styled(Button)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

const ModTableRow = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;

const ModLabel = styled(Label)({
  margin: "0!important"
});

const ModGridColumn = styled(GridColumn)({
  textAlign: 'center!important'
});

const ModSegment = styled(Segment)({
  marginTop: "5px!important",
  height: "50px!important",
});

const ModTableFooterCell = styled(Table.HeaderCell)`
  background-color: rgb(255, 255, 255)!important;
  text-align: ${({ align }) => align || "center"} !important;
  strong{
    margin-right: 1rem!important;
  };
`;

const ModTableHeaderCell = styled(Table.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  text-align: ${({ align }) => align || "center"} !important;
`;

const ModTableCell = styled(Table.Cell)({
  textAlign: 'center!important'
});

export { DataContainer, HeaderContainer, ModButton, ModGridColumn, ModLabel, ModSegment, ModTable, ModTableCell, ModTableFooterCell, ModTableHeaderCell, ModTableRow, SubContainer };

