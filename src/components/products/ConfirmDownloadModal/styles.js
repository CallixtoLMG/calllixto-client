import { Modal as SModal } from "semantic-ui-react";
import styled from "styled-components";

const Modal = styled(SModal)`
  width: 100%!important;
  max-width: 90%!important;
  max-height: 90vh!important;
`;

const ModalHeader = styled(SModal.Header)`
  margin-bottom: 20px;
`;

export { Modal, ModalHeader };

