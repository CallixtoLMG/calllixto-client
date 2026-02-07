'use client';
import { COLORS, ICONS, SIZES } from '@/common/constants';
import { isDateBefore } from '@/common/utils/dates';
import { useState } from 'react';
import { List, ListItem, Modal, Popup, Transition } from 'semantic-ui-react';
import styled from 'styled-components';
import { IconedButton } from '../../buttons';
import { Accent, Icon } from '../../custom';
import {
  StyledListHeader,
  StyledModalContent,
  StyledModalHeader
} from "../ModalShortcuts/styles";

const StyledModal = styled(Modal)`
  width: 80vw !important;
  max-height: 90vh !important;
  overflow: auto;
`;

const ModalUpdates = () => {
  const activeVersion = '2026-02-06';
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
            size={SIZES.LARGE}
            name={ICONS.BULLHORN}
            color={COLORS.BLUE}
            onClick={() => setOpen(true)}
          />
        }
        position="bottom right"
        size={SIZES.TINY}
      />
      <Transition visible={open} animation="scale" duration={500}>
        <StyledModal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas Novedades - 21 - 11 - 2025" />
          <StyledModalContent>
            <StyledListHeader>
              <Icon name={ICONS.ADD} color={COLORS.BLUE} />Nuevo
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Las ventas confirmadas ahora pueden recibir un descuento posterior a su confirmación, permitiendo descontar un monto numérico del total y evitar que queden pequeños saldos pendientes.
              </ListItem>
              <ListItem>
                En <Accent>Configuración</Accent> / <Accent>Ventas</Accent> / <Accent>General</Accent> se agregó la opción de definir un valor predeterminado para el rango de tiempo con el cual se solicitan los presupuestos.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />
              Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se restableció la posibilidad de confirmar comentarios en los productos al crear una venta utilizando la tecla <Accent>Enter</Accent>.
              </ListItem>
              <ListItem>
                Se mejoró el filtro de la sección <Accent>Ventas</Accent>, incorporando la posibilidad de filtrar ventas confirmadas según su estado de pago: <Accent>pagadas</Accent> o <Accent>pendientes</Accent>.
              </ListItem>
              <ListItem>
                Se optimizaron las tablas en todas las secciones para permitir abrir un elemento en una pestaña nueva directamente mediante el clic con el botón central del mouse (rueda).
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
        </StyledModal>
      </Transition>
    </>
  );
};

export default ModalUpdates;