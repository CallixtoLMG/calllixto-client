import { Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Button, Header, Modal, Icon as SIcon, Transition } from 'semantic-ui-react';
import { ButtonContainer, Form } from "./styles";


const ModalDelete = ({ title, onDelete, showModal, setShowModal, isLoading }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const { handleSubmit } = useForm();

  const inputElement = useRef(null);

  useEffect(() => {
    inputElement?.current?.focus();
    setConfirmationText('');
  }, [showModal]);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Transition visible={showModal} animation='scale' duration={500}>
      <Modal closeIcon open={showModal} onClose={() => setShowModal(false)}>
        <Header icon='archive' content={title || ""} />
        <Modal.Actions>
          <Form onSubmit={handleSubmit(onDelete)}>
            <Input
              margin="0"
              placeholder="Escriba 'borrar' para eliminar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange}
              ref={inputElement}
              width="220px"
            />
            <ButtonContainer flexDirection="row-reverse">
              <Button fluid
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='green'
                type="submit"
              >
                <SIcon name='checkmark' />Si
              </Button>
              <Button fluid color='red' onClick={() => setShowModal(false)} disabled={isLoading}>
                <SIcon name='trash' />No
              </Button>
            </ButtonContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  )
};

export default ModalDelete;