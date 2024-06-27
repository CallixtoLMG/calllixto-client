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
                  <List.Description>Me desplazo por las distintas pestañas de la página.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + enter</StyledListHeader>
                  <List.Description>En cada página principal, nos lleva a la creación de un nuevo elemento.</List.Description>
                  <List.Description>Durante la creación de un nuevo elemento, lo confirma.</List.Description>
                  <List.Description>Durante la creación de un presupuesto, establece un borrador.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + alt + enter</StyledListHeader>
                  <List.Description>Durante la creación de un presupuesto, lo confirma o establece en pendiente.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + suprimir</StyledListHeader>
                  <List.Description>Durante la creación de un elemento, limpia el formulario.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
                <StyledListIcon name='keyboard' />
                <StyledListContent>
                  <StyledListHeader>Control + flecha derecha o flecha izquierda</StyledListHeader>
                  <List.Description>Nos permite desplazarnos en la tablas, si hay más de una página.</List.Description>
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