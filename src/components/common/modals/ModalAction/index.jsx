import { ButtonsContainer, Input } from "@/components/common/custom";
import { COLORS, ICONS } from "@/constants";
import { handleKeyPressWithSubmit } from "@/utils";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Header, Modal, Transition } from 'semantic-ui-react';
import { IconnedButton } from "../../buttons";
import { Form, Message, ModalContent } from "./styles";

const ModalAction = ({
  title,
  onConfirm,
  confirmationWord = 'eliminar',
  placeholder = `Escriba "${confirmationWord}" para confirmar`,
  confirmButtonText = 'Confirmar',
  confirmButtonIcon = 'check',
  showModal,
  setShowModal,
  isLoading,
  noConfirmation = false,
  bodyContent = false,
  disableButtons = false,
  requireReason = false,
  warning,
  reason = '',
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isActionEnabled, setIsActionEnabled] = useState(false);
  const { handleSubmit } = useForm();
  const inputElement = useRef(null);

  useEffect(() => {
    if (!noConfirmation) {
      inputElement?.current?.focus();
    }
    setConfirmationText('');
  }, [showModal, noConfirmation]);

  useEffect(() => {
    const isReasonValid = requireReason ? reason.trim().length > 0 : true;
    const isConfirmationValid = confirmationText.toLowerCase() === confirmationWord || noConfirmation;
    setIsActionEnabled(isReasonValid && isConfirmationValid && !disableButtons);
  }, [reason, confirmationText, disableButtons, requireReason, confirmationWord, noConfirmation]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyPressWithSubmit(e, isActionEnabled, isLoading, handleSubmit, onConfirm);
    };

    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, isActionEnabled, isLoading, handleSubmit, onConfirm]);

  const handleConfirmationTextChange = (e) => {
    setConfirmationText(e.target.value);
  };

  return (
    <Transition visible={showModal} animation='scale' duration={500}>
      <Modal closeIcon open={showModal} onClose={() => setShowModal(false)}>
        <Header icon={confirmButtonIcon} content={title || ""} />
        {bodyContent && (
          <ModalContent>
            <Message negative={warning}>{bodyContent}</Message>
          </ModalContent>
        )}
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onConfirm)}>
            {!noConfirmation && !disableButtons && !requireReason && (
              <Input
                height="40px"
                placeholder={placeholder}
                type="text"
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                ref={inputElement}
                width="230px"
                tabIndex="0"
              />
            )}
            <ButtonsContainer>
              <IconnedButton
                text="Cancelar"
                icon={ICONS.TIMES}
                height="40px"
                color={COLORS.RED}
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              />
              <IconnedButton
                text={confirmButtonText}
                icon={ICONS.CHECK}
                height="40px"
                disabled={!isActionEnabled || isLoading || disableButtons}
                loading={isLoading}
                color={COLORS.GREEN}
                submit
              />
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalAction;
