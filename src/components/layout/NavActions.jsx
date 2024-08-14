import { Box, Flex } from '@/components/common/custom';
import { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { IconnedButton } from '../common/buttons';

const ActionsContainer = styled(Flex)`
  column-gap: 10px;
`;

const NavActionsContext = createContext();

const NavActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const resetActions = () => setActions([]);

  return (
    <NavActionsContext.Provider value={{ actions, setActions, resetActions }}>
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
  const { actions } = useNavActionsContext();
  return (
    <ActionsContainer>
      {actions.map(action => {
        const { id, icon, color, onClick, text, button } = action;
        return (
          <Box key={`action_${id}`} >
            {button ? button : (
              <IconnedButton
                text={text}
                icon={icon}
                color={color}
                onClick={onClick}
                width="110px"
              />
            )}
          </Box>
        );
      })}
    </ActionsContainer>
  );
};

export { NavActions, NavActionsProvider, useNavActionsContext };

