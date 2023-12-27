import { Header as SHeader, Table } from "semantic-ui-react";
import styled from "styled-components";

const Cell = styled(Table.Cell)`
  text-align: ${(props) => props.align || "center!important"};
  height: 40px;
  z-index: 2;
`;

const HeaderCell = styled(Table.HeaderCell)`
  background-color: #EEEEEE!important;
  text-align: center!important;
`;

const Header = styled(SHeader)`
  padding: 5px!important;
  text-align: center!important;
  position: relative!important;
  display: flex!important;
`;

const ActionsContainer = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(calc(100% + 5px));
  transition: all 0.1s ease-in-out;
  padding: 4px;
  opacity: 0;
  visibility: hidden;
  border: 1px solid #d4d4d5;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-color: #f7f7f7;
  column-gap: 3px;
`;

const LinkRow = styled(Table.Row)`
  cursor: pointer;
  position: relative;

  &:hover ${ActionsContainer} {
    opacity: 1;
    visibility: visible;
  }
`;


export { ActionsContainer, Cell, Header, HeaderCell, LinkRow };

