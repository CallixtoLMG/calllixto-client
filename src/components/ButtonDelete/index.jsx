"use client";
import { useState } from 'react';
import { toast } from "react-hot-toast";
import { Button, Header, Icon, Modal } from 'semantic-ui-react';

const ButtonDelete = ({ product }) => {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      closeIcon
      open={open}
      trigger={<Button color='red' size='tiny'>Eliminar</Button>}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Header icon='archive' content='Esta seguro que de sea borra el producto?' />
      <Modal.Actions>
        <Button color='red' onClick={() => setOpen(false)}>
          <Icon name='remove' /> No
        </Button>
        <Button color='green' onClick={() => {
          setOpen(false);
          deleteProduct(product.id);
          toast.success("Producto eliminado exitosamente",
            { duration: 4000 })
        }}>
          <Icon name='checkmark' /> Si
        </Button>
      </Modal.Actions>
    </Modal>
  )
};

export default ButtonDelete;