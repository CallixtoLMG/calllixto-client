import { Flex } from '@/components/common/custom';
import { Segment as SSegment, Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(STable.Cell)`
  height: 37px!important;
  padding: 2px 7px!important;
  z-index: 2;
  text-align: ${({ align = 'center' }) => `${align}!important`};
  text-align-last: ${({ align = 'center', $right }) => $right ? 'right!important' : `${align}!important`};
  white-space: ${({ $wrap }) => $wrap ? 'wrap' : 'nowrap'}!important;
  border-bottom: ${({ $basic }) => $basic && '1px solid black'};
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
  border: 1px solid black;
`;

const TableHeader = styled(STable.Header)`
  height: 35px!important;
`;

const HeaderCell = styled(STable.HeaderCell)`
  background-color: ${({ $basic }) => !$basic && '#EEEEEE!important'};
  text-align: ${({ textAlign = "center" }) => `${textAlign}!important`};
  width: ${({ width }) => width}!important;
  padding: ${({ padding }) => padding}!important;
  max-height: ${({ maxhHeight }) => maxhHeight}!important;
`;

const ActionsContainer = styled.td`
  position: absolute;
  right: ${({ $header }) => $header ? "auto" : "0"};
  left: ${({ $header }) => $header ? "-100px" : "auto"};
  top: ${({ $header }) => $header ? "0px" : "50%"};
  transform: ${({ deleteButtonInside, $header }) => {
    if (deleteButtonInside) return 'translateY(-50%)';
    return $header ? 'translateX(calc(100%))' : "translateY(-50%) translateX(calc(100%))";
  }} !important;
  transition: all 0.1s ease-in-out!important;
  opacity: ${({ $header, $open }) => $header || $open ? "1" : "0"};
  visibility: ${({ $header, $open, stillShow }) => $header || $open && stillShow ? "visible" : "hidden"};
  border: none!important;
  padding: ${({ $header }) => $header && "0!important"};
  padding-left: 5px !important;
`;

const InnerActionsContainer = styled(Flex)`
  border: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "1px solid #d4d4d5"} !important;
  background-color: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "#f7f7f7"} !important;
  padding: ${({ deleteButtonInside, $header }) => {
    if (deleteButtonInside) return '0';
    return $header ? '8px 5px' : '5px';
  }} !important;
  border-radius: ${({ $header }) => $header ? "10px 0 0 10px" : "0 10px 10px 0"};
  column-gap: 3px;
`;

const TableRow = styled(STable.Row)`
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

const LinkCell = styled(STable.Cell)`
  height: 35px!important;
  padding: 2px 7px!important;
  cursor: pointer;
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

export { ActionsContainer, Cell, Container, FiltersContainer, HeaderCell, InnerActionsContainer, LinkCell, PaginationContainer, Segment, Table, TableHeader, TableRow };

