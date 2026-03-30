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
  const activeVersion = '2026-03-30';
  const latestNews = window?.localStorage?.getItem('latestNews');
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
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas novedades - 30 - 03 - 2026" />
          <StyledModalContent>
            <StyledListHeader>
              <Icon name={ICONS.ADD} color={COLORS.BLUE} />Nuevo
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se incorporó el <Accent>Control de stock</Accent> en productos. Desde la página de cada producto podés registrar entradas y salidas de stock de forma manual, y consultar el historial de movimientos.
              </ListItem>
              <ListItem>
                Se incorporó la <Accent>Importación masiva de stock</Accent>. Desde la página de un proveedor podés cargar stock para múltiples productos a la vez importando un archivo Excel.
              </ListItem>
              <ListItem>
                El stock se descuenta automáticamente al <Accent>confirmar o registrar una entrega</Accent> en un presupuesto, siempre que el producto tenga el control de stock habilitado.
              </ListItem>
            </List>
            {/* <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                El botón de <Accent>Descargar excel</Accent> se encuentra ahora debajo de cada tabla y el archivo solo incluirá los elementos filtrados.
              </ListItem>
              <ListItem>
                La sección <Accent>Ventas</Accent> ahora solo muestra registros de los últimos 3 meses (esto se realizó para mejorar el rendimiento en esa página, que al tener tantos elementos generaba muchas demoras). En caso de necesitar registros anteriores, se agregó la sección <Accent>Historial de ventas</Accent>.
              </ListItem>
              <ListItem>
                Se actualizaron los buscadores de clientes, productos, proveedores y marcas para mostrar coincidencias a medida que se escribe y facilitar la selección.
              </ListItem>
              <ListItem>
                Los <Accent>proveedores</Accent> ahora tienen un campo de ID de dos caracteres que los identifica en las importaciones de stock.
              </ListItem>
              <ListItem>
                Se mejoró el rendimiento general y se realizaron ajustes visuales en diferentes partes del sistema para optimizar la experiencia del usuario.
              </ListItem>
            </List> */}
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