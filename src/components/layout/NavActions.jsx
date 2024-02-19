import { createContext, useContext, useState } from 'react';
import { Button, ButtonContent, Icon } from 'semantic-ui-react';
import { Flex, Box } from 'rebass';
import styled from 'styled-components';

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
          <Box key={`action_${id}`} width="90px">
            {button ? button : (
              <Button
                animated="vertical"
                color={color}
                onClick={onClick}
                type="button"
                fluid
              >
                <ButtonContent hidden>{text}</ButtonContent>
                <ButtonContent visible>
                  <Icon name={icon} />
                </ButtonContent>
              </Button>
            )}
          </Box>
        );
      })}
    </ActionsContainer>
  );
};

export { NavActionsProvider, useNavActionsContext, NavActions };
