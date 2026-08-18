import { Flex } from '@/common/components/custom';
import { Pagination as SPagination, Segment as SSegment, Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const MOBILE_BREAKPOINT = 767;

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
  max-width: 100%;
  min-width: 0;
  max-height: ${({ $tableHeight = 'none' }) => `${$tableHeight}!important`};
  overflow-y: ${({ $tableHeight }) => $tableHeight && "auto"} !important;
  overflow-x: auto !important;
  padding: 2px 0;

  @media print {
    max-height: none !important;
    overflow: visible !important;
  }
`;

const Pagination = styled(SPagination)`
  margin: auto!important;
`;

const PaginationContainer = styled(Flex)`
  width:100%;
  align-items: center;
  position: sticky;
  left: 0;
  z-index: 3;
  align-self: center;
  max-height: ${({ height = 'none' }) => `${height}!important`};
  flex-direction: row;
  justify-content: ${({ $justifyContent = "flex-end" }) => $justifyContent && $justifyContent}!important;
  column-gap: 10px;
  justify-content: center;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    max-width: 100%;
    flex-direction: column;
    row-gap: 8px;
    align-items: center;
    justify-content: center !important;

    > * {
      flex: 0 0 auto;
      max-width: 100%;
    }
  }
`;

const FiltersContainer = styled(Flex)`
  column-gap: 10px;
  row-gap: 10px;
  align-items: center;
  flex-direction: row!important;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 100%;
    max-width: 100%;
    flex-wrap: wrap;
    align-items: stretch;

    > .field {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      flex: 1 1 100% !important;
    }

    > button {
      flex: 0 0 auto;
      align-self: flex-start !important;
    }
  }
`;

const Segment = styled(SSegment)`
  padding: 10px!important;
  margin-bottom: 8px!important;
  margin-top: 0!important;
`;

const Table = styled(STable)`
  width: max-content!important;
  min-width: 100%!important;
  max-height: ${({ $tableHeight = "none" }) => `${$tableHeight}!important`};
  overflow-y: auto!important;
  overflow-x: visible!important;
  border: 1px solid black;

  @media print {
    width: 100%!important;
    min-width: 0!important;
    max-height: none!important;
    overflow: visible!important;
  }
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

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    opacity: 1;
    visibility: visible;
  }
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
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 100%;
    max-width: 100%;
  }
`;

const HeaderSegment = styled(SSegment)`
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  padding: 5px 10px !important;
  margin: 0 !important;
  column-gap: 10px;
  row-gap: 10px;
  align-content: center;
  justify-content: space-between;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
  box-sizing: border-box;
`;

const FiltersActions = styled(Flex)`
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 100%;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
    row-gap: 8px;

    .ui.dropdown.button {
      max-width: 100%;
    }
  }
`;

const ResponsiveHeaderSegment = styled(HeaderSegment)`
  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

export { ActionsContainer, Cell, Container, FiltersActions, FiltersContainer, HeaderCell, ResponsiveHeaderSegment as HeaderSegment, InnerActionsContainer, LinkCell, LinkContent, LinkOverlay, MainContainer, Pagination, PaginationContainer, Segment, Table, TableHeader, TableRow };

