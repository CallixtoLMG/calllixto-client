import { Box, Flex, Icon as SIcon } from '@/common/components/custom';
import { StyledModalHeader } from '@/common/components/modals/ModalShortcuts/styles';
import { COLORS, ICONS, SIZES } from '@/common/constants';
import { createContext, useContext, useState } from 'react';
import { Modal, Popup, Transition } from 'semantic-ui-react';
import styled from 'styled-components';
import { IconedButton } from '../../common/components/buttons';

const Icon = styled(SIcon)`
  cursor: pointer;
`;

const StyledModal = styled(Modal)`
  width: 80vw !important;
  max-height: 90vh !important;
  overflow: auto;
`;

const NavActionsContext = createContext();

const NavActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const [info, setInfo] = useState(null);
  const resetActions = () => setActions([]);

  return (
    <NavActionsContext.Provider value={{ actions, setActions, info, setInfo, resetActions }}>
      {children}
    </NavActionsContext.Provider>
  );
};

const useNavActionsContext = () => {
  const context = useContext(NavActionsContext);
  if (context === undefined) {
    throw new Error('useNavActionsContext must be used within a NavActionsProvider');
  }
  return context;
};

const NavActions = () => {
  const { actions, info } = useNavActionsContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Flex $columnGap="10px" $alignItems="center">
        {actions.map(({ id, icon, color, onClick, text, button, disabled, width, basic, loading, tooltip, iconOnly, popupPosition }) => {
          const popupContent = tooltip ? (
            <div>
              <div><strong>{text}</strong></div>
              <div>{tooltip}</div>
            </div>
          ) : text;

          return (
            <Box key={`action_${id}`}>
              {button ? button : (
                <IconedButton
                  text={text}
                  icon={icon}
                  color={color}
                  basic={basic}
                  onClick={onClick}
                  width={width}
                  disabled={disabled}
                  loading={loading}
                  iconOnly={iconOnly}
                  popupContent={popupContent}
                  popupPosition={popupPosition}
                />
              )}
            </Box>
          );
        })}
        {info && (
          <Popup
            content="Información sobre esta sección."
            trigger={
              <Icon
                name={ICONS.INFO_CIRCLE}
                color={COLORS.BLUE}
                size={SIZES.LARGE}
                onClick={() => setOpen(true)}
              />
            }
            position="bottom right"
            size={SIZES.TINY}
          />
        )}
      </Flex>
      <Transition visible={open} animation="scale" duration={500}>
        <StyledModal open={open} onClose={() => setOpen(false)}>
          <StyledModalHeader icon={ICONS.INFO_CIRCLE} content="¿Cómo funciona esta sección?" />
          {info}
          <Modal.Actions>
            <IconedButton
              text="Cerrar"
              icon={ICONS.REMOVE}
              color={COLORS.RED}
              onClick={() => { setOpen(false); }}
            />
          </Modal.Actions>
        </StyledModal>
      </Transition>
    </>
  );
};


export { NavActions, NavActionsProvider, useNavActionsContext };

