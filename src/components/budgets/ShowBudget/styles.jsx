import { Flex } from "rebass";
import { Button as SButton, Segment as SSegment, Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  flex-direction: row;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: 200px!important;
`;

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

const Row = styled(STable.Row)`
  th:first-child { width: 50px!important; };
`;

const Segment = styled(SSegment)`
  margin-top: 5px!important;
  height: 50px!important;
`;

const FooterCell = styled(STable.HeaderCell)`
  background-color: rgb(255, 255, 255)!important;
  text-align: ${({ align }) => align || "center"} !important;
  strong{
    margin-right: 1rem!important;
  };
`;

const HeaderCell = styled(STable.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  text-align: ${({ align }) => align || "center"} !important;
`;

const Cell = styled(STable.Cell)({
  textAlign: 'center!important'
});

const Table = styled(STable)`
  margin-top: 5px !important;
`;

export { DataContainer, Button, Segment, Cell, FooterCell, HeaderCell, Row, SubContainer, Table };

