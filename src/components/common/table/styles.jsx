import { Flex } from '@/components/common/custom';
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
  width: ${({ width }) => width}!important;
  padding: ${({ padding }) => padding}!important;
  max-height: ${({ maxhHeight }) => maxhHeight}!important;
`;

const FooterCell = styled(STable.HeaderCell)`
  padding: 5px 7px !important;
`;

const ActionsContainer = styled.td`
  position: absolute;
  right: 0;
  top: ${({ header }) => header ? "0px" : "50%"};
  transform: ${({ deleteButtonInside, header }) => {
    if (deleteButtonInside) return 'translateY(-50%)';
    return header ? 'translateX(calc(100%))' : "translateY(-50%) translateX(calc(100%))";
  }} !important;
  transition: all 0.1s ease-in-out!important;
  opacity: ${({ header }) => header ? "1" : "0"};
  visibility: ${({ header }) => header ? "visible" : "hidden"};
  border: none!important;
  padding: ${({ header }) => header && "0!important"};
  padding-left: 5px !important;
`;

const InnerActionsContainer = styled(Flex)`
  border: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "1px solid #d4d4d5"} !important;
  background - color: ${({ deleteButtonInside }) => deleteButtonInside ? 'none' : "#f7f7f7"} !important;
  padding: ${({ deleteButtonInside, header }) => {
    if (deleteButtonInside) return '0';
    return header ? '8px 5px' : '5px';
  }} !important;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
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

const CheckboxContainer = styled(Flex)`
  position: ${({ selection }) => selection ? "relative" : "static"} ;
  align-items: center;
  border-radius: 5px;
  padding: 3px;
  justify-content: center;
  left: ${({ selection }) => selection ? "11px" : "10px"} ;
`;

export { ActionsContainer, Button, Cell, CheckboxContainer, Container, FiltersContainer, FooterCell, HeaderCell, InnerActionsContainer, LinkCell, PaginationContainer, PaginationSegment, Segment, Table, TableFooter, TableHeader, TableRow };

