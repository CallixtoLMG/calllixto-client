import { ButtonsContainer, Input } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header, Transition } from 'semantic-ui-react';
import { Form, Modal, ModalContent } from "./styles";
import { IconnedButton } from "../../buttons";

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
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={onClose}>
        <Header icon={icon} content={title} ></Header>
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
              placeholder="Escriba 'borrar' para eliminar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="220px"
            />
            <ButtonsContainer>
              <IconnedButton
                text="Cancelar"
                icon="times"
                color="grey"
                onClick={onClose}
                disabled={isLoading}
              />
              <IconnedButton
                text="Eliminar"
                icon="trash"
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color="red"
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
