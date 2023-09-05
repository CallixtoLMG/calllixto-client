import { useState } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';

const ButtonDelete = ({opened}) => {
  const [open, setOpen] = useState(false)

  return (
    <Modal
      closeIcon
      open={opened}
      trigger={<Button color='red' size='tiny'>Eliminar</Button>}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Header icon='archive' content='Esta seguro que de sea borra el producto?' />
      <Modal.Actions>
        <Button color='red' onClick={() => setOpen(false)}>
          <Icon name='remove' /> No
        </Button>
        <Button color='green' onClick={() => setOpen(false)}>
          <Icon name='checkmark' /> Si
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default ButtonDelete;