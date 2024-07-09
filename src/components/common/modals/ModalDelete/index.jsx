import { Button, ButtonsContainer, Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Header, Modal, Icon as SIcon, Transition } from 'semantic-ui-react';
import { Form } from "./styles";


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
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='green'
                type="submit"
              >
                <SIcon name='checkmark' />Si
              </Button>
              <Button
                height="40px"
                color='red'
                onClick={() => setShowModal(false)} disabled={isLoading}>
                <SIcon name='trash' />No
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  )
};

export default ModalDelete;