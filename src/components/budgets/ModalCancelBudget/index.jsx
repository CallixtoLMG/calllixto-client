import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, FieldsContainer, Label, TextArea } from "@/components/common/custom";
import { COLORS, ICONS } from "@/constants";
import { useState } from "react";
import { Modal, Transition } from "semantic-ui-react";
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
            <IconnedButton text="Cancelar" icon={ICONS.CANCEL} color={COLORS.RED} onClick={() => onClose(false)} disabled={isLoading} />
            <IconnedButton
              text="Anular"
              icon={ICONS.BAN}
              color={COLORS.RED}
              onClick={() => onConfirm(cancelReason)}
              disabled={!cancelReason || isLoading}
              loading={isLoading}
              basic
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition >
  );
};

export default ModalCancel;