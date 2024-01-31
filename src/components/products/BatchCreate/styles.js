import { Flex } from "rebass";
import { Container, Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const Modal = styled(SModal)`
  width: 90%!important;
  height: 90vh!important;
`;

const ModalActions = styled(SModal.Actions)`
  display: flex;
  justify-content: flex-end;
`;

const ContainerModal = styled(Flex)`
  flex-direction: column!important;
  padding: 30px!important;
  width: 100%!important;
`;

const DataNotFoundContainer = styled(Container)`
  text-align: center!important;
  p {
    font-size: 15px!important;
  };
`;

const TableContainer = styled(Flex)`
  width: 100%;
  margin-top: 5px !important;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const WarningMessage = styled.p`
  margin-left: 5px!important;
  color: red;
  font-size: 10px!important;
`;

export { ContainerModal, DataNotFoundContainer, Modal, ModalActions, TableContainer, WarningMessage };

