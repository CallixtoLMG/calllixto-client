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
  const activeVersion = '2026-05-20';
  const latestNews = typeof window !== 'undefined' ? window.localStorage.getItem('latestNews') : activeVersion;
  const [open, setOpen] = useState(!latestNews || isDateBefore(latestNews, activeVersion));

  return (
    <>
      <Popup
        content="Últimas novedades"
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
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas novedades - 16 - 05 - 2026" />
          <StyledModalContent>
            <StyledListHeader>
              <Icon name={ICONS.ADD} color={COLORS.BLUE} />Nuevo
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se incorporó una pantalla de <Accent>mantenimiento</Accent> para informar cuando la web no esté disponible temporalmente.
              </ListItem>
              <ListItem>
                Los usuarios con rol <Accent>Super Admin</Accent> ahora pueden crear nuevos usuarios.
              </ListItem>
              <ListItem>
                Se agregó un botón para <Accent>imprimir las entregas</Accent> registradas en una venta.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />
              Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se agregó información adicional en <Accent>Configuración</Accent> para explicar mejor el uso de cada propiedad.
              </ListItem>
              <ListItem>
                Ahora, al salir de la creación de un elemento con <Accent>cambios sin guardar</Accent>, se mostrará una confirmación antes de descartar la información.
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
