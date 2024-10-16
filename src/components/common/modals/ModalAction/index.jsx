import { ButtonsContainer, Input } from "@/components/common/custom";
import { COLORS, ICONS } from "@/constants";
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
    setIsActionEnabled(noConfirmation || disableButtons); 
  }, [showModal, noConfirmation, disableButtons]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsActionEnabled(text.toLowerCase() === confirmationWord && !disableButtons);
  };

  return (
    <Transition visible={showModal} animation='scale' duration={500}>
      <Modal closeIcon open={showModal} onClose={() => setShowModal(false)}>
        <Header icon={confirmButtonIcon} content={title || ""} />
        {bodyContent && (
          <ModalContent>
            <Message>{bodyContent}</Message>
          </ModalContent>
        )}
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onConfirm)}>
            {!noConfirmation && !disableButtons && ( 
              <Input
                height="40px"
                placeholder={placeholder}
                type="text"
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                ref={inputElement}
                width="230px"
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
