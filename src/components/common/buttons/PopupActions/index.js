import { cloneElement, useState } from 'react';
import { Popup } from 'semantic-ui-react';
import { IconnedButton } from '..';
import { ButtonsContainer, Flex } from '../../custom';

const PopupActions = ({ width, title, color, buttons, icon, position = "bottom center", trigger, onToggleOpen }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    if (onToggleOpen) onToggleOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (onToggleOpen) onToggleOpen(true);
  };

  return (
    <Popup
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
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
                handleClose();
                if (child.props.onClick) {
                  child.props.onClick();
                }
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