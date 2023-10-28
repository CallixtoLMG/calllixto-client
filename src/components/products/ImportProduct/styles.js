import Link from "next/link";
import { Flex } from "rebass";
import { Button, Input, Label, Table } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin-left: 12px!important;
  flex-direction: row!important;
  padding: 10px!important;
`;

const ContainerModal = styled(Flex)`
  flex-direction: column!important;
  padding: 10px!important;
`;

const ModInput = styled(Input)`
  // opacity: 0!important;
  // width: 0!important;
  // height: 0!important;
  align-self: center!important;
  max-height: 36px!important;
    > input  {
    padding: 6px!important;
    }
`;

const SubContainer = styled(Flex)`
  flex-direction: row;
  justify-content: center;
  margin-top: 14px!important;
`;

const ModTableCell = styled(Table.Cell)({
});

const ModTableHeaderCell = styled(Table.HeaderCell)({
  background: "#EEEEEE!important"
});

const ModLink = styled(Link)({
  width: "fit-content",
});

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModButton = styled(Button)({
  width: "170px!important",
  padding: "10px 0!important",
});

const ModalModLabel = styled(Label)({
  margin: "0 0 14px 0!important",
  display: "block!important"
});

const ModLabel = styled(Label)`
  > span {
    width: 170px!important;
    padding: 10px 0!important;
  }
`;

const WarningMessage = styled.p`
  margin-left: 5px!important;
  color: red;
`;

const ModTableRow = styled(Table.Row)`
  th:not(:first-child) {min-width: 150px!important}
  th:first-child { width: 50px!important };
  th:nth-child(2){min-width: 100px!important;}
  th:nth-child(3){min-width: 250px!important;}
  th:last-child { width: 250px!important; };
`;

export { ContainerModal, MainContainer, ModButton, ModInput, ModLabel, ModLink, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow, ModalModLabel, SubContainer, WarningMessage };


