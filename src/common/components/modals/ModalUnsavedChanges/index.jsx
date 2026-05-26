import { ButtonsContainer, Modal } from "@/common/components/custom";
import { CONTENT_SIZES, COLORS, ICONS } from "@/common/constants";
import { Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";

const UnsavedChangesModal = ({ open, onDiscard, onContinue }) => (
  <Transition visible={open} animation="scale" duration={500}>
    <Modal width="50%" open={open} onClose={onContinue}>
      <Modal.Header>¡Existen cambios sin guardar!</Modal.Header>
      <Modal.Content>
        Si salís ahora, los cambios se perderán.
      </Modal.Content>
      <Modal.Actions>
        <ButtonsContainer>
          <IconedButton
            text="Continuar editando"
            icon={ICONS.EDIT}
            color={COLORS.BLUE}
            width={CONTENT_SIZES.FIT}
            basic
            onClick={onContinue}
          />
          <IconedButton
            text="Descartar cambios"
            icon={ICONS.TIMES}
            color={COLORS.RED}
            width={CONTENT_SIZES.FIT}
            onClick={onDiscard}
          />
        </ButtonsContainer>
      </Modal.Actions>
    </Modal>
  </Transition>
);

export default UnsavedChangesModal;
