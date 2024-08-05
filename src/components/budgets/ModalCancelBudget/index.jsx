import { ButtonsContainer, FieldsContainer, IconedButton, Label, TextArea } from "@/components/common/custom";
import { useState } from "react";
import { Icon, Modal, Transition } from "semantic-ui-react";
import { ModalContent } from "./styles";

const ModalCancel = ({ isModalOpen, onClose, onConfirm, isLoading }) => {
  const [cancelReason, setCancelReason] = useState("");
  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal open={isModalOpen} onClose={() => onClose(false)}>
        <Modal.Header>
          Desea anular la venta?
        </Modal.Header>
        <ModalContent>
          <FieldsContainer rowGap="5px" width="100%">
            <Label>Motivo</Label>
            <TextArea
              padding="10px"
              width="100%"
              placeholder="Motivo de anulación..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </FieldsContainer>
        </ModalContent>
        <Modal.Actions>
          <ButtonsContainer width="100%" marginTop="10px">
            <IconedButton
              icon
              labelPosition="left"
              disabled={isLoading}
              type="button"
              color="grey"
              onClick={() => onClose(false)}
            >
              <Icon name="close" />
              Cancelar
            </IconedButton>
            <IconedButton
              icon
              labelPosition="left"
              color="red"
              onClick={() => onConfirm(cancelReason)}
              disabled={!cancelReason || isLoading}
              loading={isLoading}
              basic
            >
              <Icon name="ban" />
              Anular
            </IconedButton>
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition >
  );
};

export default ModalCancel;