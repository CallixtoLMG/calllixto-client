'use client';
import { COLORS, ICONS, POPUP_POSITIONS, SIZES } from '@/common/constants';
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

const ModalUpdates = ({ trigger }) => {
  const activeVersion = '2026-09-21';
  const latestNews = typeof window !== 'undefined' ? window.localStorage.getItem('latestNews') : activeVersion;
  const [open, setOpen] = useState(!latestNews || isDateBefore(latestNews, activeVersion));
  const handleOpen = () => setOpen(true);

  return (
    <>
      {trigger ? trigger(handleOpen) : (
        <Popup
          content="Últimas novedades"
          trigger={
            <Icon
              $cursor
              margin="0"
              $pointer
              size={SIZES.LARGE}
              name={ICONS.BULLHORN}
              color={COLORS.BLUE}
              onClick={handleOpen}
            />
          }
          position={POPUP_POSITIONS.BOTTOM_RIGHT}
          size={SIZES.TINY}
        />
      )}
      <Transition visible={open} animation="scale" duration={500}>
        <StyledModal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas novedades - 21 - 08 - 2026" />
          <StyledModalContent>
            <StyledListHeader>
              <Icon name={ICONS.ADD} color={COLORS.BLUE} />Nuevo
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                <Accent>Presupuestos públicos</Accent>: ahora podés compartir un presupuesto mediante una vista pública para que el cliente lo consulte desde un enlace.
              </ListItem>
              <ListItem>
                <Accent>Acceso a Pandora</Accent>: agregamos la entrada desde el menú de Callixto. Pandora es nuestra herramienta complementaria para limpiar, ordenar y preparar archivos Excel y CSV.
              </ListItem>
              <ListItem>
                <Accent>Barra lateral de acciones</Accent>: renovamos el acceso a las acciones de cada pantalla para encontrar opciones frecuentes de forma más rápida y ordenada.
              </ListItem>
              <ListItem>
                <Accent>Limpieza automática</Accent>: los presupuestos anulados se eliminan automáticamente después de 3 meses, ayudando a mantener el historial más ordenado.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />
              Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                <Accent>Anulación de presupuestos</Accent>: al anular o eliminar un presupuesto, Callixto ahora revierte correctamente los movimientos de stock y pagos asociados.
              </ListItem>
              <ListItem>
                <Accent>Pantallas más chicas</Accent>: mejoramos la adaptación de formularios, tablas, acciones y modales para facilitar el uso desde notebooks y dispositivos móviles.
              </ListItem>
              <ListItem>
                <Accent>Tablas y acciones</Accent>: ajustamos filtros, selección de elementos, paginación y accesos rápidos para trabajar con listas de forma más clara.
              </ListItem>
              <ListItem>
                <Accent>Contraseñas</Accent>: ordenamos las pantallas de inicio de sesión, recuperación y cambio de contraseña para que el flujo sea más claro.
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
