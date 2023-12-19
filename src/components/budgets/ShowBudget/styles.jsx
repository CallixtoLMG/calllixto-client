import { Flex } from "rebass";
import { Button as SButton, Segment as SSegment, Table as STable} from "semantic-ui-react";
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

const Table = styled(STable)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

const Row = styled(Table.Row)`
  th:first-child { width: 50px!important; };
`;
const Segment = styled(SSegment)({
  marginTop: "5px!important",
  height: "50px!important",
});

const FooterCell = styled(Table.HeaderCell)`
  background-color: rgb(255, 255, 255)!important;
  text-align: ${({ align }) => align || "center"} !important;
  strong{
    margin-right: 1rem!important;
  };
`;

const TableHeader = styled(Table.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  text-align: ${({ align }) => align || "center"} !important;
`;

const Cell = styled(Table.Cell)({
  textAlign: 'center!important'
});

export { DataContainer, HeaderContainer, Button, Segment, Table, Cell, FooterCell, TableHeader, Row, SubContainer };

