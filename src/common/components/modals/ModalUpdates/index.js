'use client';
import { COLORS, ICONS } from '@/common/constants';
import { useState } from 'react';
import { List, ListItem, Modal, Popup, Transition } from 'semantic-ui-react';
import { IconedButton } from '../../buttons';
import { Icon } from '../../custom';
import {
  StyledListHeader,
  StyledModalContent,
  StyledModalHeader
} from "../ModalShortcuts/styles";
import { isDateBefore } from '@/common/utils/dates';

const ModalUpdates = () => {
  const activeVersion = '2025-06-09';
  const latestNews = window?.localStorage?.getItem('latestNews');
  const [open, setOpen] = useState(!latestNews || isDateBefore(latestNews, activeVersion));

  return (
    <>
      <Popup
        content="Últimas Novedades"
        trigger={
          <Icon
            margin="0"
            pointer="true"
            size="large"
            name={ICONS.BULLHORN}
            color={COLORS.BLUE}
            onClick={() => setOpen(true)}
          />
        }
        position="bottom right"
        size="tiny"
      />
      <Transition visible={open} animation="scale" duration={500}>
        <Modal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas Novedades - 10 - 06 - 2025" />
          <StyledModalContent>
            <StyledListHeader><Icon name={ICONS.ADD} color="blue" />Nuevo</StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Nueva pestaña para la visualización del historial de cambios de un producto.
              </ListItem>
              <ListItem>
                Guardado de filtros aplicados en las tablas principales durante la navegación.
              </ListItem>
              <ListItem>
                Visualización de fechas de pago ordenadas cronológicamente en los PDF.
              </ListItem>
              <ListItem>
                Atajos de teclado en pestaña &quot;pagos&quot; de una venta confirmada:
                <ListItem as="ol" value="-">
                  <ListItem as='li' value='-'>
                    Control + Enter: envía el formulario si corresponde.
                  </ListItem>
                  <ListItem as='li' value='-'>
                    Control + Delete: restaura el formulario a los valores originales.
                  </ListItem>
                </ListItem>
              </ListItem>
            </List>
          </StyledModalContent>
          <Modal.Actions>
            <IconedButton
              text="Cerrar"
              icon={ICONS.REMOVE}
              color={COLORS.RED}
              onClick={() => {
                window.localStorage.setItem('latestNews', activeVersion);
                setOpen(false);
              }}
            />
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  );
};

export default ModalUpdates;
