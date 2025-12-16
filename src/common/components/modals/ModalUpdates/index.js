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
                Se incorporaron dos nuevas secciones: <Accent>Gastos</Accent> y <Accent>Caja</Accent>. Estas funcionalidades están disponibles en modo de prueba durante 30 días. Pasado ese período se deshabilitarán automáticamente y deberán contactar con el administrador para su contratación.
              </ListItem>
              <ListItem>
                La sección <Accent>Gastos</Accent> permite registrar consumos y egresos, generando un historial detallado.
              </ListItem>
              <ListItem>
                La sección <Accent>Caja</Accent> permite abrir y cerrar cajas configurando fechas y métodos de pago. Mientras estén abiertas, se vinculan automáticamente los pagos asociados a ventas y gastos.
              </ListItem>
              <ListItem>
                Se incorporó la sección <Accent>Historial de ventas</Accent>, que permite buscar información sobre ventas anteriores a los últimos 3 meses.
              </ListItem>
              <ListItem>
                Ahora es posible previsualizar un presupuesto antes de imprimirlo en cualquiera de sus formatos.
              </ListItem>
              <ListItem>
                En la página de <Accent>Ventas</Accent> se agregó un nuevo filtro. Al visualizar las ventas confirmadas, ahora es posible filtrar por <Accent>Estado de pago</Accent>, ya sea pendiente o pagado.
              </ListItem>
              <ListItem>
                Las ventas confirmadas ahora pueden recibir un descuento posterior a su confirmación, lo que permite descontar un monto numérico del total y evitar quedar con pequeños saldos pendientes.
              </ListItem>
              <ListItem>
                En <Accent>Configuración</Accent> se agregó la pestaña <Accent>Ventas</Accent>, para definir valores predeterminados al crear o imprimir una venta.
              </ListItem>
              <ListItem>
                En la parte superior derecha de todas las páginas principales se agregó el ícono <Icon name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />. Al hacer clic, se despliega una pantalla con información sobre el funcionamiento de la sección.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                El botón de <Accent>Descargar Excel</Accent> se encuentra ahora debajo de cada tabla y el archivo solo incluirá los elementos filtrados.
              </ListItem>
              <ListItem>
                La sección <Accent>Ventas</Accent> ahora solo muestra registros de los últimos 3 meses (esto se realizó para mejorar el rendimiento en esa página, que al tener tantos elementos generaba muchas demoras). En caso de necesitar registros anteriores, se agregó la sección <Accent>Historial de Ventas</Accent>.
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