import { ButtonsContainer } from "@/common/components/custom";
import { CONTENT_SIZES, COLORS, ICONS } from "@/common/constants";
import { Icon, Modal, Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { CloseButton, UnsavedModal } from "./styles";

const UnsavedChangesModal = ({ open, onDiscard, onContinue }) => (
  <Transition visible={open} animation="scale" duration={500}>
    <UnsavedModal width="50%" open={open} onClose={onContinue}>
      <Modal.Header>
        ¡Existen cambios sin guardar!
        <CloseButton
          type="button"
          aria-label="Continuar editando"
          onClick={onContinue}
        >
          <Icon name={ICONS.TIMES} />
        </CloseButton>
      </Modal.Header>
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
    </UnsavedModal>
  </Transition>
);

export default UnsavedChangesModal;
