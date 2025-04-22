import { ButtonsContainer } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { handleKeyPressWithSubmit } from "@/common/utils";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Header, Modal, Transition } from 'semantic-ui-react';
import { IconedButton } from "../../buttons";
import { TextField } from "../../form";
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
  reasonInputRef
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
    if (showModal && reasonInputRef?.current) {
      const timeout = setTimeout(() => {
        reasonInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [showModal, reasonInputRef]);

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
              <TextField
                ref={inputElement}
                placeholder={placeholder}
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                tabIndex="0"
                width="300px"
              />
            )}
            <ButtonsContainer>
              <IconedButton
                text="Cancelar"
                icon={ICONS.TIMES}
                height="40px"
                color={COLORS.RED}
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              />
              <IconedButton
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
