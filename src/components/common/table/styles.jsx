import { Flex } from "rebass";
import { Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(STable.Cell)`
  height: 35px!important;
  padding: 2px 7px!important;
  z-index: 2;
  text-align: ${({ align }) => align || "center!important"};
  text-align-last: ${(props) => props.right && "right!important"};
  white-space: ${({ wrap }) => wrap || "nowrap"};
`;

const Container = styled(Flex)`
  flex-direction: column;
  margin: 5px 0!important;
  width: 100% !important;
  max-height: ${({ tableHeight }) => tableHeight || ""} !important;
  overflow-y: ${({ tableHeight }) => tableHeight && "auto"} !important;
  overflow-x: ${({ tableHeight }) => tableHeight && "auto"} !important;

`;

const Table = styled(STable)`
  max-height: ${({ tableHeight }) => tableHeight || ""} !important;
  overflow-y: auto!important;
  overflow-x: hidden!important;
`;

const TableHeader = styled(STable.Header)`
  height: 35px!important;
`;

const TableFooter = styled(STable.Footer)`
  height: 35px!important;
`;

const HeaderCell = styled(STable.HeaderCell)`
  background-color: #EEEEEE!important;
  text-align: ${({ textAlign }) => textAlign || 'center'} !important;
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

export { ActionsContainer, Cell, Container, HeaderCell, InnerActionsContainer, LinkRow, Table, TableFooter, TableHeader, TableRow };

