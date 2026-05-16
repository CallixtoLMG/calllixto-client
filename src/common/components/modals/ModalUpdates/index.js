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
  const activeVersion = '2026-04-29';
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
                Se incorporó la <Accent>Importación en bache de stock</Accent>. Desde la página de un proveedor podés cargar stock para múltiples productos a la vez importando un archivo Excel.
              </ListItem>
              <ListItem>
                El stock se descuenta automáticamente al <Accent>confirmar o registrar una entrega</Accent> en un presupuesto, siempre que el producto tenga el control de stock habilitado.
              </ListItem>
              <ListItem>
              En la página de <Accent>Crear Venta</Accent> ahora podés crear un cliente directamente sin salir de la venta.
              </ListItem>
            </List>
            <StyledListHeader>
              <Icon name={ICONS.PENCIL} color={COLORS.BLUE} />
              Actualizaciones
            </StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Se realizaron <Accent>mejoras visuales en diferentes partes del sistema</Accent> con el objetivo de optimizar la experiencia general de uso y lograr una interfaz más clara y ordenada.
              </ListItem>
              <ListItem>
                Se ajustó la estética de distintos <Accent>botones y acciones</Accent> para optimizar el espacio disponible en pantalla. Mantienen la misma funcionalidad de siempre y, al pasar el mouse por encima, se muestra un mensaje indicativo para facilitar su identificación.
              </ListItem>
              <ListItem>
                Se reorganizaron distintos <Accent>formularios y espacios</Accent> para mantener mayor coherencia en los márgenes, alineaciones y estructura general, logrando una presentación más uniforme en todo el sistema.
              </ListItem>
              <ListItem>
                Se incorporó un nuevo <Accent>menú lateral de navegación</Accent> que permite acceder más rápido a las distintas secciones del sistema desde cualquier pantalla.
              </ListItem>
              <ListItem>
                Ahora podés <Accent>ingresar directamente a los listados</Accent> haciendo click sobre el nombre de cada sección, evitando pasos innecesarios.
              </ListItem>
              <ListItem>
                Se actualizó el menú de usuario a la derecha, para mantener una <Accent>estética más moderna y consistente</Accent> con el resto de la aplicación.
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