import { Box, Flex } from '@/components/common/custom';
import { createContext, useContext, useState } from 'react';
import { IconnedButton } from '../common/buttons';

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
    <Flex columnGap="10px">
      {actions.map(({ id, icon, color, onClick, text, button, disabled, width, basic, loading }) => {
        return (
          <Box key={`action_${id}`} >
            {button ? button : (
              <IconnedButton
                text={text}
                icon={icon}
                color={color}
                basic={basic}
                onClick={onClick}
                width={width || "110px"}
                disabled={disabled}
                loading={loading}
              />
            )}
          </Box>
        );
      })}
    </Flex>
  );
};

export { NavActions, NavActionsProvider, useNavActionsContext };

