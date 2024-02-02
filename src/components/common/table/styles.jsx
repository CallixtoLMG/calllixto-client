import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(Table.Cell)`
  height: 35px!important;
  padding: 2px 7px!important;
  z-index: 2;
  text-align: ${({ align }) => align || "center!important"};
  text-align-last: ${(props) => props.right && "right!important"};
`;

const TableHeader = styled(Table.Header)`
  height: 35px!important;
`;

const TableFooter = styled(Table.Footer)`
  height: 35px!important;
`;

const HeaderCell = styled(Table.HeaderCell)`
  background-color: #EEEEEE!important;
  text-align: ${({ textAlign }) => textAlign || 'center'} !important;
`;

const ActionsContainer = styled.td`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(calc(100%));
  transition: all 0.1s ease-in-out;
  opacity: 0;
  visibility: hidden;
  border: none !important;
  padding-left: 5px !important;
`;

const InnerActionsContainer = styled(Flex)`
  border: 1px solid #d4d4d5 !important;
  background-color: #f7f7f7;
  padding: 5px !important;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  column-gap: 3px;
`;

const LinkRow = styled(Table.Row)`
  cursor: pointer;
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

const TableRow = styled(Table.Row)`
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;

export { ActionsContainer, Cell, HeaderCell, InnerActionsContainer, LinkRow, TableFooter, TableHeader, TableRow };

