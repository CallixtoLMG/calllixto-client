import { Modal as SModal, Table } from "semantic-ui-react";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 15px;
`;

const ModalContent = styled(SModal.Content)`
  max-height: 70vh;
  overflow: auto;
`;

const TableRow = styled(Table.Row)`

`;

const Modal = styled(SModal)`
  width: 100%!important;
  max-width: 80%!important;
  max-height: 90vh!important;
`;

export { Form, Modal, ModalContent, TableRow };

