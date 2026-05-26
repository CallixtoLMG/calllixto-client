import { Flex } from '@/common/components/custom';
import { Pagination as SPagination, Segment as SSegment, Table as STable } from "semantic-ui-react";
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
  max-height: ${({ $tableHeight = 'none' }) => `${$tableHeight}!important`};
  overflow-y: ${({ $tableHeight }) => $tableHeight && "auto"} !important;
  overflow-x: ${({ $tableHeight }) => $tableHeight && "auto"} !important;
  padding: 2px 0;
`;

const Pagination = styled(SPagination)`
  margin: auto!important;
`;

const PaginationContainer = styled(Flex)`
  width:100%;
  align-items: center;
  position: relative; 
  align-self: center;
  max-height: ${({ height = 'none' }) => `${height}!important`};
  flex-direction: row;
  justify-content: ${({ $justifyContent = "flex-end" }) => $justifyContent && $justifyContent}!important;
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
  max-height: ${({ $tableHeight = "none" }) => `${$tableHeight}!important`};
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
  width: ${({ $width }) => $width}!important;
  padding: ${({ padding }) => padding}!important;
  max-height: ${({ maxhHeight }) => maxhHeight}!important;
  cursor: ${({ $cursor }) => $cursor}!important;
`;

const ActionsContainer = styled.td`
  position: ${({ $header }) => $header ? "absolute" : "static"};
  left: ${({ $header }) => $header ? "-100px" : "auto"};
  top: ${({ $header }) => $header ? "0" : "auto"};
  transform: ${({ $header }) => $header ? 'translateX(calc(100%))' : "none"} !important;
  width: ${({ $header }) => $header ? "auto" : "52px"} !important;
  min-width: ${({ $header }) => $header ? "auto" : "52px"} !important;
  max-width: ${({ $header }) => $header ? "none" : "52px"} !important;
  height: ${({ $header }) => $header ? "auto" : "37px"} !important;
  border: ${({ $header }) => $header ? "none!important" : undefined};
  padding: ${({ $header }) => $header ? "0 0 0 5px" : "2px"} !important;
  text-align: center !important;
  vertical-align: middle !important;
`;

const InnerActionsContainer = styled(Flex)`
  justify-content: center;
  border: ${({ $header }) => $header ? "1px solid #d4d4d5" : "none"} !important;
  background-color: ${({ $header }) => $header ? "#f7f7f7" : "transparent"} !important;
  padding: ${({ $header }) => $header ? "8px 5px" : "0"} !important;
  border-radius: ${({ $header }) => $header ? "10px 0 0 10px" : "0"};
  column-gap: 3px;
  transition: opacity 0.1s ease-in-out!important;
  opacity: ${({ $header, $open }) => $header || $open ? "1" : "0"};
  visibility: ${({ $header, $open }) => $header || $open ? "visible" : "hidden"};
`;

const TableRow = styled(STable.Row)`
  position: relative;

  &:hover ${InnerActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

const LinkCell = styled(STable.Cell)`
  height: 35px!important;
  padding: 2px 7px!important;
  cursor: pointer;
  position: relative;
  white-space: ${({ $whiteSpace }) => `${$whiteSpace}!important`};
  text-align: ${({ align }) => `${align}!important`};
`;

const LinkOverlay = styled.a`
  position: absolute;
  inset: 0;
  z-index: 2;
  text-decoration: none;
  color: inherit;
`;

const LinkContent = styled.div`
  z-index: 1;
  pointer-events: none;
`;

const MainContainer = styled(Flex)`
  column-gap: 10px;
`;

const HeaderSegment = styled(SSegment)`
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  padding: 5px 10px !important;
  margin: 0 !important;
  column-gap: 10px;
  align-content: center;
  justify-content: space-between;
`;

export { ActionsContainer, Cell, Container, FiltersContainer, HeaderCell, HeaderSegment, InnerActionsContainer, LinkCell, LinkContent, LinkOverlay, MainContainer, Pagination, PaginationContainer, Segment, Table, TableHeader, TableRow };

