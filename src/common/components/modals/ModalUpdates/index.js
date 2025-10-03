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
            <StyledListHeader><Icon name={ICONS.ADD} color="blue" />Nuevo</StyledListHeader>
            <List relaxed bulleted as="ol">
              <ListItem>
                Posibilidad de ordenar las tablas principales de forma ascendente o descendente haciendo click en el nombre de la columna.
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
