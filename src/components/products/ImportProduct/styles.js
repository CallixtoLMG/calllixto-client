import Link from "next/link";
import { Flex } from "rebass";
import { Button, Container, Input, Label, Table } from "semantic-ui-react";
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

const SubContainer = styled(Flex)`
  flex-direction: row;
  justify-content: center;
  margin-top: 14px!important;
`;

const ModTableHeaderCell = styled(Table.HeaderCell)`
  background: #EEEEEE!important;
  text-align: center!important;
  tr:nth-child(2){ width: 50px!important;}
`;

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

const ModalHeaderContainer = styled(Container)`
  margin: 0 0 14px 0 !important;
  margin-left: 0!important;
`;

const ModInput = styled(Input)`
  input {
    border: none!important;
    background-color: inherit!important;
    padding: 0!important;
    text-align: center!important;
  }
`;

const WarningMessage = styled.p`
  margin-left: 5px!important;
  color: red;
  font-size: 10px!important;
`;

const ModTableRow = styled(Table.Row)`
  th:not(:first-child) {min-width: 150px!important}
  th:first-child { width: 50px!important };
  th:nth-child(2){width: 100px!important;}
  th:nth-child(3){min-width: 250px!important;}
  th:last-child { width: 250px!important; };
`;

export { ContainerModal, MainContainer, ModButton, ModInput, ModLabel, ModLink, ModTable, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage };


