"use client";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import { ModIcon, ModInput } from "./styles";

const ButtonDelete = ({ params, deleteQuestion, onDelete }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Modal
      closeIcon
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={(<Button color='red' size='tiny' content={<ModIcon name="trash" />} />)}
    >
      <Header icon='archive' content={deleteQuestion || ""} />
      <Modal.Actions>
        <ModInput
          placeholder="Escriba 'borrar' para eliminar"
          type="text"
          value={confirmationText}
          onChange={handleConfirmationTextChange} />
        <Button color='red' onClick={() => setOpen(false)}>
          <Icon name='trash' />No
        </Button>
        <Button disabled={!isDeleteEnabled} color='green' onClick={() => {
          setOpen(false);
          onDelete(params)
          router.refresh();
        }}>
          <Icon name='checkmark' />Si
        </Button>
      </Modal.Actions>
    </Modal>
  )
};

export default ButtonDelete;