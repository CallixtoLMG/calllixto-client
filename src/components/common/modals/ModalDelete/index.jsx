import { ButtonsContainer, Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { Header, Modal, Transition } from 'semantic-ui-react';
import { Form } from "./styles";
import { IconnedButton } from "../../buttons";

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
              <IconnedButton
                text="Cancelar"
                icon="times"
                height="40px"
                color="grey"
                onClick={() => setShowModal(false)} disabled={isLoading}
              />
              <IconnedButton
                text="Eliminar"
                icon="trash"
                height="40px"
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
  )
};

export default ModalDelete;