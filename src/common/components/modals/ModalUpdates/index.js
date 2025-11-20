'use client';
import { COLORS, ICONS, SIZES } from '@/common/constants';
import { isDateBefore } from '@/common/utils/dates';
import { useState } from 'react';
import { List, ListItem, Modal, Popup, Transition } from 'semantic-ui-react';
import { IconedButton } from '../../buttons';
import { Icon } from '../../custom';
import {
  StyledListHeader,
  StyledModalContent,
  StyledModalHeader
} from "../ModalShortcuts/styles";
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  width: 80vw !important;
  max-height: 90vh !important;
  overflow: auto;
`;

const ModalUpdates = () => {
  const activeVersion = '2025-11-25';
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
                Se incorporaron dos nuevas secciones: <strong>Gastos</strong> y <strong>Caja</strong>. Estas funcionalidades están disponibles en modo de prueba durante 30 días. Pasado ese período se deshabilitarán automáticamente y deberán contactar con el administrador para su contratación.
              </ListItem>
              <ListItem>
                La sección <strong>Gastos</strong> permite registrar consumos y egresos, generando un historial detallado.
              </ListItem>
              <ListItem>
                La sección <strong>Caja</strong> permite abrir y cerrar cajas configurando fechas y métodos de pago. Mientras estén abiertas, se vinculan automáticamente los pagos asociados a ventas y gastos.
              </ListItem>
              <ListItem>
                Ahora es posible previsualizar un presupuesto antes de imprimirlo en cualquiera de sus formatos.
              </ListItem>
              <ListItem>
                En <strong>Configuración</strong> se agregó la pestaña <strong>Ventas</strong>, para definir valores predeterminados al crear o imprimir una venta.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                El botón de <strong>Descargar Excel</strong> se encuentra ahora debajo de cada tabla y el archivo solo incluirá los elementos filtrados.
              </ListItem>
              <ListItem>
                Se actualizaron los buscadores de clientes, productos, proveedores y marcas para mostrar coincidencias a medida que se escribe y facilitar la selección.
              </ListItem>
              <ListItem>
                Se mejoró el rendimiento general y se realizaron ajustes visuales en diferentes partes del sistema para optimizar la experiencia del usuario.
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