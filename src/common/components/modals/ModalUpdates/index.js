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

const ModalUpdates = () => {
  const activeVersion = '2025-07-08';
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
        <Modal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas Novedades - 08 - 07 - 2025" />
          <StyledModalContent>
            <StyledListHeader>
              <Icon name={ICONS.ADD} color={COLORS.BLUE} />Novedades
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se incorporaron dos nuevas secciones: <strong>Gastos</strong> y <strong>Caja</strong>. Estas funcionalidades están disponibles en modo de prueba durante 30 días. Pasado ese período se deshabilitarán automáticamente, salvo que se abone la mensualidad correspondiente para mantenerlas activas.
              </ListItem>
              <ListItem>
                La sección <strong>Gastos</strong> permite registrar consumos y egresos, generando un historial detallado.
              </ListItem>
              <ListItem>
                La sección <strong>Caja</strong> permite abrir y cerrar cajas configurando fechas y métodos de pago. Mientras estén abiertas, se vinculan automáticamente las ventas y gastos realizados.
              </ListItem>
              <ListItem>
                Se mejoró el rendimiento general y se realizaron ajustes visuales en diferentes partes del sistema para optimizar la experiencia de uso.
              </ListItem>
              <ListItem>
                Se actualizaron los buscadores de clientes, productos y proveedores para mostrar coincidencias a medida que se escribe y facilitar la selección.
              </ListItem>
              <ListItem>
                Ahora es posible visualizar un presupuesto antes de imprimirlo en cualquiera de sus formatos.
              </ListItem>
              <ListItem>
                El botón de <strong>Descarga a Excel</strong> se encuentra ahora debajo de cada tabla.
              </ListItem>
              <ListItem>
                En caso de que se apliquen filtros a las tablas, el boton "Descargar Excel" incluirá en el archivo de excel solo los elementos visibles, para evitar descargar datos innecesarios.
              </ListItem>
              <ListItem>
                En <strong>Configuración</strong> se agregó la pestaña <strong>Ventas</strong>, para definir valores predeterminados al crear o imprimir una venta.
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