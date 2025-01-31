import { IconedButton } from "@/components/common/buttons";
import { ButtonsContainer } from "@/components/common/custom";
import { COLORS, ICONS } from "@/common/constants";
import { useState } from "react";
import { Modal, Transition } from "semantic-ui-react";
import { Message, ModalContent } from "./styles";
import { TextField } from "@/components/common/form";

const ModalCancel = ({ isModalOpen, onClose, onConfirm, isLoading, id }) => {
  const [cancelReason, setCancelReason] = useState("");
  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal open={isModalOpen} onClose={() => onClose(false)}>
        <Modal.Header>
          Desea anular la venta?
        </Modal.Header>
        <ModalContent>
          <Message>
            <TextField
              placeholder="Motivo"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              tabIndex="0"
            />
          </Message>
        </ModalContent>
        <Modal.Actions>
          <ButtonsContainer width="100%" marginTop="10px">
            <IconedButton text="Cancelar" icon={ICONS.CANCEL} color={COLORS.RED} onClick={() => onClose(false)} disabled={isLoading} />
            <IconedButton
              text="Anular"
              icon={ICONS.BAN}
              color={COLORS.RED}
              onClick={() => onConfirm(cancelReason, id)}
              disabled={!cancelReason || isLoading}
              loading={isLoading}
              basic
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalCancel;