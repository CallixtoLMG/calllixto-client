import { Button as SButton, Dropdown as SDropdown, Table, Label as SLabel } from 'semantic-ui-react';
import styled from 'styled-components';

const Button = styled(SButton)({
  width: "170px!important",
  padding: "10px 0!important",
});

const TotalText = styled.h3`
  margin-left: 0.7rem;
`;

const Dropdown = styled(SDropdown)`
  width: 300px !important;
  display: flex!important;
  margin-bottom: 20px!important;
  margin-top: 5px!important;
  height: 40px!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15) !important;
`;

const ModTableRow = styled(Table.Row)`
  th{ min-width: 10rem!important; };
  th:first-child { min-width: 18rem!important; };
  th:nth-child(3) { min-width: 6rem!important; };
  th:nth-child(5) { min-width: 6rem!important; };
  th:nth-child(6) { min-width: 10rem!important; };
  th:nth-child(7) { min-width: 6rem!important; };
  th:not(:first-child) { width: 13rem!important; };
`;

const HeaderCell = styled(Table.HeaderCell)`
  background-color: ${props => props.$header && "#EEEEEE!important"};
  padding: ${(props) => props.$nonBorder ? "0!important" : "11px!important"};
  text-align: ${props => props.$right ? "right!important" : "center!important"};
  h3 {
    margin-right: 0.7rem!important;
  };
`;

const Cell = styled(Table.Cell)`
  padding: ${(props) => props.$nonBorder ? "0!important" : "5px!important"};
  text-align: center!important;
  `;

const WarningMessage = styled.p`
  position: relative;
  margin: 5px 0 0 0!important;
  color: red;
`;

const Label = styled(SLabel)`
  width: 100% !important;
  margin: 0!important;
`;

export { Button, Dropdown, Cell, HeaderCell, ModTableRow, TotalText, WarningMessage, Label };

