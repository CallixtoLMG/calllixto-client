import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { Transition } from "semantic-ui-react";
import { Modal, ModalHeader } from "./styles";

export const ConfirmDownloadModal = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
}) => {
  return (
    <Transition animation="scale" duration={500} visible={open}>
      <Modal open={open} onClose={onCancel} >
        <ModalHeader>{title}</ModalHeader>
        <Modal.Content>
          <p>{description}</p>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              text={cancelText}
              icon={ICONS.X}
              color={COLORS.RED}
              onClick={onCancel}
              disabled={loading}
            />
            <IconedButton
              text={confirmText}
              icon={ICONS.CHECK}
              color={COLORS.GREEN}
              onClick={onConfirm}
              loading={loading}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition >

  );
};
