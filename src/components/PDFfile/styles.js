import { Flex } from "rebass";
import { GridColumn, Header, Image, Label, Segment, Table } from "semantic-ui-react";
import styled from "styled-components";

const CustomerDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
`;

const ClientDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
`;

const HeaderContainer = styled(Flex)`
  flex-direction: row!important;
  justify-content: space-between;
  width: 100%;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 0px 0!important;
  width: 200px!important;
`;

const PayMethodContainer = styled(Flex)`
  margin-top: 20px!important;
  align-items: center;
`;

const ModTitleHeader = styled(Header)`
  display: flex!important;
  margin: 0!important;
  align-items: end!important;
  font-size: 40px!important;
  color: rgba(235,124,21,255)!important;
`;

const Divider = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 15px;
  background-color: rgba(0,152,57,255);
  margin: 20px 0;
`;

const Sign = styled.div`
  width: 30%;
  height: 3px;
  color: green;
  border-radius: 15px;
  background-color: rgba(0,152,57,255);
  margin-top: 70px;
`;

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  };
`;

const ModTableRow = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;

const ModTableLabel = styled(Label)({
  marginTop: "10px!important",
});

const ModLabel = styled(Label)({
  margin: "0!important"
});

const ModPayMethodLabel = styled(Label)({
  display: "flex!important",
  alignItems: "center!important",
  justifyContent: "center!important",
});

const ModGridColumn = styled(GridColumn)({
  textAlign: 'center!important'
});

const ModSegment = styled(Segment)({
  marginTop: "5px!important",
  height: "50px!important",
});

const ModTableHeaderCell = styled(Table.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  text-align: ${props => props.$left ? "left!important" : "center!important"}
`;

const ModTableCell = styled(Table.Cell)({
  textAlign: 'center!important'
});

const ModImage = styled(Image)`
  &&& {
    width: 250px!important;
    height: 100px!important;
  };
`;

const ModPayMethodHeader = styled(Header)`
  margin: 20px 0 0 0!important;
`;



export { ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, ModGridColumn, ModImage, ModLabel, ModPayMethodHeader, ModPayMethodLabel, ModSegment, ModTable, ModTableCell, ModTableHeaderCell, ModTableLabel, ModTableRow, ModTitleHeader, PayMethodContainer, Sign };

