import { ButtonsContainer, Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Header, Modal, Icon as SIcon, Transition, Button } from 'semantic-ui-react';
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
        <Header icon='trash' content={title || ""} />
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
            <ButtonsContainer>
              <Button
                icon
                labelPosition="left"
                height="40px"
                color='grey'
                onClick={() => setShowModal(false)} disabled={isLoading}
                >
                <SIcon name='times' />CANCELAR
              </Button>
              <Button
                icon
                labelPosition="left"
                height="40px"
                disabled={!isDeleteEnabled || isLoading}
                loading={isLoading}
                color='red'
                type="submit"
              >
                <SIcon name='trash' />ELIMINAR
              </Button>
            </ButtonsContainer>
          </Form>
        </Modal.Actions>
      </Modal>
    </Transition>
  )
};

export default ModalDelete;