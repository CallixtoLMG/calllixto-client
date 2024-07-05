import { Flex } from "rebass";
import { Button as SButton, Segment as SSegment, Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(STable.Cell)`
  height: 37px!important;
  padding: 2px 7px!important;
  z-index: 2;
  text-align: ${({ align = 'center' }) => `${align}!important`};
  text-align-last: ${({ align = 'center', $right }) => $right ? 'right!important' : `${align}!important`};
  white-space: ${({ $wrap }) => $wrap ? 'wrap' : 'nowrap'}!important;
`;

const Container = styled(Flex)`
  flex-direction: column;
  width: 100% !important;
  max-height: ${({ tableHeight = 'none' }) => `${tableHeight}!important`};
  overflow-y: ${({ tableHeight }) => tableHeight && "auto"} !important;
  overflow-x: ${({ tableHeight }) => tableHeight && "auto"} !important;
`;

const PaginationContainer = styled(Flex)`
  align-self: center;
  max-height: ${({ height = 'none' }) => `${height}!important`};
  flex-direction: row;
  justify-content: ${({ center }) => center ? "center" : "flex-end"};
  column-gap: 10px;
  justify-content: center;
`;

const PaginationSegment = styled(SSegment)`
  line-height: 1!important;
  height:35px!important;
  margin: 0!important;
  padding: 10px!important;
`;

const FiltersContainer = styled(Flex)`
  column-gap: 10px;
  align-items: center;
  flex-direction: row!important;
`;

const Segment = styled(SSegment)`
  padding: 10px!important;
  margin-bottom: 8px!important;
  margin-top: 0!important;
`;

const Table = styled(STable)`
  max-height: ${({ tableHeight = "none" }) => `${tableHeight}!important`};
  overflow-y: auto!important;
  overflow-x: hidden!important;
`;

const Button = styled(SButton)`
  margin: ${({ marginLeft = "0" }) => `0 0 0 ${marginLeft}!important`};
  visibility: ${({ hidden }) => hidden && "hidden"} !important;
  height: 35px!important;
  align-self: center;
`;

const TableHeader = styled(STable.Header)`
  height: 35px!important;
`;

const TableFooter = styled(STable.Footer)`
  height: 35px!important;
`;

const HeaderCell = styled(STable.HeaderCell)`
  background-color: ${({ basic }) => !basic && '#EEEEEE!important'};
  text-align: ${({ textAlign = "center" }) => `${textAlign}!important`};
`;

const FooterCell = styled(STable.HeaderCell)`
  padding: 5px 7px !important;
`;

const ActionsContainer = styled.td`
  position: absolute;
  right: 0;
  top: 50%;
  transform: ${({ deleteButtonInside }) => deleteButtonInside ? 'translateY(-50%)' : "translateY(-50%) translateX(calc(100%))"} !important;
  transition: all 0.1s ease-in-out;
  opacity: 0;
  visibility: hidden;
  border: none !important;
  padding-left: 5px !important;
`;

const InnerActionsContainer = styled(Flex)`
  border: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "1px solid #d4d4d5"} !important;
  background-color: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "#f7f7f7"} !important;
  padding: ${({ deleteButtonInside }) => deleteButtonInside ? '0' : "5px"} !important;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  column-gap: 3px;
`;

const LinkRow = styled(STable.Row)`
  cursor: pointer;
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

const TableRow = styled(STable.Row)`
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

export { ActionsContainer, Button, Cell, Container, FiltersContainer, FooterCell, HeaderCell, InnerActionsContainer, LinkRow, PaginationContainer, PaginationSegment, Segment, Table, TableFooter, TableHeader, TableRow };

