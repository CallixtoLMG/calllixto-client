import { cloneElement } from 'react';
import { Popup } from 'semantic-ui-react';
import { IconnedButton } from '..';
import { ButtonsContainer, Flex } from '../../custom';

const PopupActions = ({ width, title, color, buttons, icon, position = "bottom center", trigger, open, onOpen, onClose }) => {

  return (
    <Popup
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      position={position}
      trigger={trigger || (
        <ButtonsContainer>
          <IconnedButton
            text={title}
            icon={icon}
            width={width}
            color={color}
          />
        </ButtonsContainer>
      )}
      content={
        <Flex rowGap="5px" flexDirection="column">
          {buttons?.map((child) =>
            cloneElement(child, {
              onClick: () => {
                if (child.props.onClick) {
                  child.props.onClick(); 
                }
                if (onClose) onClose(); 
              }
            })
          )}
        </Flex>
      }
      on="click"
    />
  );
};

export default PopupActions;