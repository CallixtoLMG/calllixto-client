import { Flex } from "rebass";
import { Label, Segment, Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModTableRow = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;

const ModLabel = styled(Label)({
  // maxWidth: "50vh!important",
  margin: "0!important"
});

const ModSegment = styled(Segment)({
  // maxWidth: "50vh!important",
  height: "50px!important",
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

export {
  MainContainer, ModLabel, ModSegment, ModTable, ModTableHeaderCell, ModTableRow
};

