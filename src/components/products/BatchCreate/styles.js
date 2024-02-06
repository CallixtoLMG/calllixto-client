import { Flex } from "rebass";
import { Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const Modal = styled(SModal)`
  max-width: 90%!important;
  max-height: 90vh!important;
`;

const ModalActions = styled(SModal.Actions)`
  display: flex;
  justify-content: flex-end;
  column-gap: 15px;
`;

const ContainerModal = styled(Flex)`
  flex-direction: column!important;
  padding: 30px!important;
  width: 100%!important;
`;

const WarningMessage = styled.p`
  margin-left: 5px!important;
  color: red;
  font-size: 10px!important;
`;

export { ContainerModal, Modal, ModalActions, WarningMessage };

