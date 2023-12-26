import { Table } from "semantic-ui-react";
import styled from "styled-components";
import { Flex } from "rebass";

const Cell = styled(Table.Cell)`
  text-align: center!important;
  height: 40px;
  z-index: 2;
`;

const HeaderCell = styled(Table.HeaderCell)`
  background-color: #EEEEEE!important;
  text-align: center!important;
`;

const ActionsContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(105%);
  transition: all 0.1s ease-in-out;
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  border: 1px solid #d4d4d5;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-color: #f7f7f7;
`;

const LinkRow = styled(Table.Row)`
  cursor: pointer;
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 0.8;
    visibility: visible;
  }
`;


export { HeaderCell, Cell, LinkRow, ActionsContainer };

