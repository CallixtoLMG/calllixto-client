"use client";
import { deleteProduct } from '@/app/productos/page';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import { deleteCustomer } from '../../app/clientes/page';
import { ModInput } from "./styles";

const ButtonDelete = ({ product, customer }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(true);

  const handleConfirmationTextChange = (e) => {
    const text = e.target.value;
    setConfirmationText(text);
    setIsDeleteEnabled(text.toLowerCase() === 'borrar');
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={<Button color='red' size='tiny'>Eliminar</Button>}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Header icon='archive'
        content={
          product ? `¿Está seguro que desea eliminar el producto ${product.name}?` :
            customer ? `¿Está seguro que desea eliminar al cliente ${customer.name}?` : ''
        } />
      <Modal.Actions>
        <ModInput
          placeholder="Escriba 'borrar' para eliminar"
          type="text"
          value={confirmationText}
          onChange={handleConfirmationTextChange} />
        <Button color='red' onClick={() => setOpen(false)}>
          <Icon name='remove' />No
        </Button>
        <Button disabled={!isDeleteEnabled} color='green' onClick={() => {
          setOpen(false);
          {
            customer ? deleteCustomer(customer.id) :
              product ? deleteProduct(product.code) : ""
          }
          router.refresh();
        }}>
          <Icon name='checkmark' />Si
        </Button>
      </Modal.Actions>
    </Modal>
  )
};

export default ButtonDelete;