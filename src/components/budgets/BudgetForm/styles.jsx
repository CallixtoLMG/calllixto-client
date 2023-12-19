import { Flex } from "rebass";
import { Button, Dropdown, Input, Table } from 'semantic-ui-react';
import styled from 'styled-components';

const ModInput = styled(Input)`
  input {
    border: ${(props) => props.$nonBorder && "none!important"};
    background: ${(props) => props.$greyBack && "#f9fafb!important"};
    text-align: center!important;
    padding:7px!important;
  };
`;

const ModButton = styled(Button)({
  width: "170px!important",
  padding: "10px 0!important",
});

const TotalText = styled.h3`
  margin-left: 0.7rem;
`;

const ModDropdown = styled(Dropdown)({
  width: "20rem!important",
  display: "flex!important",
  marginBottom: "20px!important",
});

const ModTableRow = styled(Table.Row)`
  th{ min-width: 10rem!important; };
  th:first-child { min-width: 18rem!important; };
  th:nth-child(3) { min-width: 6rem!important; };
  th:nth-child(5) { min-width: 6rem!important; };
  th:nth-child(6) { min-width: 10rem!important; };
  th:nth-child(7) { min-width: 6rem!important; };
  th:not(:first-child) { width: 13rem!important; };
`;

const ModTableHeaderCell = styled(Table.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  padding: ${(props) => props.$nonBorder ? "0!important" : "11px!important"};
  text-align: ${props => props.$right ? "right!important" : "center!important"};
  h3{
    margin-right: 0.7rem!important;
  };
`;

const ModTableFooter = styled(Table.Footer)`
  th:nth-child(2) { 
    min-width: 12rem!important;
    padding: 5px!important;
   };
`;

const ModTableCell = styled(Table.Cell)`
  padding: ${(props) => props.$nonBorder ? "0!important" : "5px!important"};
  text-align: center!important;
  `;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const WarningMessage = styled.p`
  position: relative;
  margin: 5px 0 0 0!important;
  color: red;
`;

export { HeaderContainer, ModButton, ModDropdown, ModInput, ModTableCell, ModTableFooter, ModTableHeaderCell, ModTableRow, TotalText, WarningMessage };

