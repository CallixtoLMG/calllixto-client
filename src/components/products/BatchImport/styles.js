import { Flex } from "@/common/components/custom";
import { Header as SHeader, Icon as SIcon, Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const Modal = styled(SModal)`
  width: 100%!important;
  max-width: 90%!important;
  max-height: 90vh!important;
`;

const BatchImportIcon = styled(SIcon)`
  && {
    font-family: Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif;
    font-size 13.5px;
    opacity: 1!important;
  }
`;

const ModalHeader = styled(SModal.Header)`
  margin-bottom: 20px;
`;

const WaitMsg = styled.p`
  font-size: 13px!important;
  margin: 0!important;
  align-content: center;
`;

const Header = styled(SHeader)`
  padding:5px!important;
  border-bottom: groove!important;
`;

const ModalActions = styled(SModal.Actions)`
  display: flex;
  justify-content: flex-end;
  column-gap: 15px;

  p {
    width: auto !important;
    flex: auto;
    text-align: -webkit-center;
    margin-left: 90px!important;
  }
`;

const ContainerModal = styled(Flex)`
  flex-direction: column!important;
  padding: 30px!important;
  max-width: 100%!important;
`;

export { BatchImportIcon, ContainerModal, Header, Modal, ModalActions, ModalHeader, WaitMsg };

