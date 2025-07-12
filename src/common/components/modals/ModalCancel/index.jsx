import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { useState } from "react";
import { Modal, Transition } from "semantic-ui-react";
import { Message, ModalContent } from "./styles";

const ModalCancel = ({ isModalOpen, onClose, onConfirm, isLoading, id, header }) => {
  const [cancelReason, setCancelReason] = useState("");
  return (
    <Transition visible={isModalOpen} animation='scale' duration={500}>
      <Modal closeIcon open={isModalOpen} onClose={() => onClose(false)}>
        <Modal.Header>
          {header}
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