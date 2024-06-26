import { useState } from 'react';
import { Button, Icon, List, Modal, Transition } from 'semantic-ui-react';
import { HelpIcon, StyledListContent, StyledListHeader, StyledListIcon, StyledModalContent, StyledModalHeader } from "./styles";

const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <HelpIcon size='large' name='keyboard' color='orange' onClick={() => setOpen(true)} />
      <Transition visible={open} animation='scale' duration={500}>
        <Modal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon='keyboard' content='Accesos rápidos del teclado' />
          <StyledModalContent>
            <List>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + 1,2,3,4,5</StyledListHeader>
                  <List.Description>Me desplazo por las distintas pestañas de la web.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + enter</StyledListHeader>
                  <List.Description>En cada página principal, nos lleva a crear un nuevo elemento.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + flecha derecha o flecha izquierda</StyledListHeader>
                  <List.Description>Nos permite desplazarnos en la tabla, si hay más de una página.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + retroceder</StyledListHeader>
                  <List.Description>Vuelve a la página anterior.</List.Description>
                </StyledListContent>
              </List.Item>
            </List>
          </StyledModalContent>
          <Modal.Actions>
            <Button color='red' onClick={() => setOpen(false)}>
              <Icon name='remove' /> Cerrar
            </Button>
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  );
};

export default KeyboardShortcuts;