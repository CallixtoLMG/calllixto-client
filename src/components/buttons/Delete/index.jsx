"use client";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { Button, Header, Icon, Modal, Popup, Transition } from 'semantic-ui-react';
import { ModIcon, ModInput } from "./styles";

const ButtonDelete = ({ params, deleteQuestion, onDelete }) => {
  const router = useRouter();
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  const handleDelete = () => {
    onDelete(params);
    setShowModal(false);
  };

  return (
    <>
      <Popup
        size="mini"
        content="Eliminar"
        trigger={<Button color='red' size='tiny' content={<ModIcon name="trash" />} onClick={handleButtonClick} />}
      />
      <Transition visible={showModal} animation='scale' duration={500}>
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <Header icon='archive' content={deleteQuestion || ""} />
          <Modal.Actions>
            <ModInput
              placeholder="Escriba 'borrar' para eliminar"
              type="text"
              value={confirmationText}
              onChange={handleConfirmationTextChange} />
            <Button color='red' onClick={() => setShowModal(false)}>
              <Icon name='trash' />No
            </Button>
            <Button
              disabled={!isDeleteEnabled}
              color='green'
              onClick={handleDelete}>
              <Icon name='checkmark' />Si
            </Button>
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  )
};

export default ButtonDelete;