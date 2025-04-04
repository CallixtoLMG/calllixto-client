import { ButtonsContainer, Modal } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { Transition } from "semantic-ui-react";
import { IconedButton } from "../../buttons";

const UnsavedChangesModal = ({ open, onSave, onDiscard, isSaving, onCancel }) => (
  <Transition visible={open} animation="scale" duration={500}>
    <Modal width="50%" open={open} onClose={isSaving ? null : onDiscard}>
      <Modal.Header>Existen cambios sin guardar!</Modal.Header>
      <Modal.Content>¿Deseás guardar los cambios antes de salir del modo edición?</Modal.Content>
      <Modal.Actions>
        <ButtonsContainer>
          <IconedButton
            text="Continuar actualizando"
            icon={ICONS.EDIT}
            height="40px"
            color={COLORS.BLUE}
            basic
            onClick={onCancel}
            disabled={isSaving}
          />
          <IconedButton
            text="Descartar cambios"
            icon={ICONS.TIMES}
            height="40px"
            color={COLORS.RED}
            onClick={onDiscard}
            disabled={isSaving}
          />
          <IconedButton
            text="Guardar cambios"
            icon={ICONS.CHECK}
            height="40px"
            loading={isSaving}
            disabled={isSaving}
            color={COLORS.GREEN}
            onClick={onSave}
            submit
          />
        </ButtonsContainer>
      </Modal.Actions>
    </Modal>
  </Transition>
);

export default UnsavedChangesModal;
