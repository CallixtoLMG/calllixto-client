import { COLORS, ICONS } from '@/common/constants';
import { useState } from 'react';
import { List, Modal, Popup, Transition } from 'semantic-ui-react';
import { IconedButton } from '../../buttons';
import { Icon } from '../../custom';
import {
  StyledListContent,
  StyledListHeader,
  StyledListIcon,
  StyledModalContent,
  StyledModalHeader
} from "../ModalShortcuts/styles";

const ModalUpdates = () => {
  const [open, setOpen] = useState(false);

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
          <StyledModalHeader icon={ICONS.BULLHORN} content="Últimas Novedades - 04 - 06 - 2025" />
          <StyledModalContent>
            <List divided relaxed>
              <List.Item>
                <StyledListIcon name={ICONS.ADD} />
                <StyledListContent>
                  <StyledListHeader>Nuevo</StyledListHeader>
                  <List.Description>- Nueva péstaña para la visualización del historial de cambios en un producto.</List.Description>
                  <List.Description>- Visualización de fechas de pago ordenadas cronológicamente en los PDF.</List.Description>
                  <List.Description>- Atajos de teclado en pagos de ventas:</List.Description>
                  <List.Description>&nbsp;&nbsp;&nbsp;• Control + Enter: envía el formulario si corresponde.</List.Description>
                  <List.Description>&nbsp;&nbsp;&nbsp;• Control + Delete: restaura el formulario a los valores originales.</List.Description>
                </StyledListContent>
              </List.Item>
              <List.Item>
              <StyledListIcon name={ICONS.CHECK} />
                <StyledListContent>
                  <StyledListHeader>Arreglos</StyledListHeader>
                  <List.Description>- Alineación de comentarios y fechas en el PDF ajustada.</List.Description>
                  <List.Description>- Registros de pago en la tabla de pagos ahora se ordenan cronológicamente por fecha.</List.Description>
                </StyledListContent>
              </List.Item>
            </List>
          </StyledModalContent>
          <Modal.Actions>
            <IconedButton
              text="Cerrar"
              icon={ICONS.REMOVE}
              color={COLORS.RED}
              onClick={() => setOpen(false)}
            />
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  );
};

export default ModalUpdates;
