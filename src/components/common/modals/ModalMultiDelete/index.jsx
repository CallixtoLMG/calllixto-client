import { ButtonsContainer, Input } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { COLORS, ICONS } from "@/constants";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header, Transition } from 'semantic-ui-react';
import { IconedButton } from "../../buttons";
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
    setIsDeleteEnabled(text.toLowerCase() === 'eliminar');
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={onClose}>
        <Header icon={icon} content={title} />
        <ModalContent>
          <Table
            headers={headers}
            elements={elements}
            mainKey="code"
          />
        </ModalContent>
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onConfirm)}>
            <Input
              height="40px"
              placeholder="Escriba 'eliminar' para confirmar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="220px"
            />
            <ButtonsContainer>
              <IconedButton
                text="Cancelar"
                icon={ICONS.TIMES}
                color={COLORS.GREY}
                onClick={onClose}
                disabled={isLoading}
              />
              <IconedButton
                text="Eliminar"
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
