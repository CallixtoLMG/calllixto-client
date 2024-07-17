import { ButtonsContainer, Input } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Header, Icon as SIcon, Transition } from 'semantic-ui-react';
import { Form, Modal, ModalContent } from "./styles";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, products, isLoading, title, icon, headers }) => {
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
            isLoading={isLoading}
            headers={headers}
            elements={products}
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
            <ButtonsContainer width="180px">
              <Button
                height="40px"
                color='red'
                onClick={onClose}
                disabled={isLoading}
              >
                <SIcon name='trash' />No
              </Button>
              <Button
                height="40px"
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='green'
                type="submit"
              >
                <SIcon name='checkmark' />Si
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ConfirmDeleteModal;
