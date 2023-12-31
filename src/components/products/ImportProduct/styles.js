import Link from "next/link";
import { Flex } from "rebass";
import { Container, Label, Table } from "semantic-ui-react";
import styled from "styled-components";

const ContainerModal = styled(Flex)`
  flex-direction: column!important;
  padding: 10px!important;
`;

const DataNotFoundContainer = styled(Container)`
  text-align: center!important;
  p {
    font-size: 15px!important;
  };
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
  border: none!important;
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  }
`;

const ModTableContainer = styled(Flex)`
  max-height: 200px!important;
  overflow-y: scroll!important;
  overflow-x: hidden!important;
  margin-bottom: 14px!important;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-bottom: 1px solid #ccc;
  border-radius: 4px!important;
`;

const ModalModLabel = styled(Label)({
  margin: "0 0 14px 0!important",
  display: "block!important"
});

const ModalHeaderContainer = styled(Container)`
  margin: 0 0 14px 0 !important;
  margin-left: 0!important;
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

const ModTableCell = styled(Table.Cell)({
  textAlign: 'center!important'
});

export { ContainerModal, DataNotFoundContainer, ModLink, ModTable, ModTableCell, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage };


