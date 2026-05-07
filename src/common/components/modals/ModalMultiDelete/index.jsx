import { ButtonsContainer } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { BUTTON_TEXTS, COLORS, CONFIRMATION_WORDS, ICONS, PLACEHOLDERS } from "@/common/constants";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header, Transition } from 'semantic-ui-react';
import { IconedButton } from "../../buttons";
import { TextField } from "../../form";
import { Form, Modal, ModalContent } from "./styles";

const ModalMultiDelete = ({ open, onClose, onConfirm, elements, isLoading, title, icon, headers }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const { handleSubmit } = useForm();
  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
    setConfirmationText('');
    setIsDeleteEnabled(false);
  }, [open]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === CONFIRMATION_WORDS.DELETE);
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={onClose}>
        <Header icon={icon} content={title} />
        <ModalContent>
          <Table
            headers={headers}
            elements={elements}
            mainKey="id"
          />
        </ModalContent>
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onConfirm)}>
            <TextField
              placeholder={PLACEHOLDERS.CONFIRM_DELETE}
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="250px"
              disabled={isLoading}
              textAlign="left"
            />
            <ButtonsContainer>
              <IconedButton
                text={BUTTON_TEXTS.CANCEL}
                icon={ICONS.TIMES}
                color={COLORS.GREY}
                onClick={onClose}
                disabled={isLoading}
              />
              <IconedButton
                text={BUTTON_TEXTS.DELETE}
                icon={ICONS.TRASH}
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color={COLORS.RED}
                submit
              />
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalMultiDelete;
