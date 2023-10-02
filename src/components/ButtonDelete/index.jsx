"use client";
import { deleteProduct } from '@/app/productos/page';
import { useState } from 'react';
import { toast } from "react-hot-toast";
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import { deleteCustomer } from '../../app/clientes/page';

const ButtonDelete = ({ product, customer }) => {
  const [open, setOpen] = useState(false);

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
        <Button color='red' onClick={() => setOpen(false)}>
          <Icon name='remove' />No
        </Button>
        <Button color='green' onClick={() => {
          setOpen(false);
          {
            customer ? deleteCustomer(customer.id) :
              product ? deleteProduct(product.code) : ""
          }
          toast.success("Elemento eliminado exitosamente",
            { duration: 4000 })
        }}>
          <Icon name='checkmark' />Si
        </Button>
      </Modal.Actions>
    </Modal>
  )
};

export default ButtonDelete;