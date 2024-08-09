import { cloneElement, useState } from 'react';
import { Popup } from 'semantic-ui-react';
import { ButtonsContainer, Flex } from '../../custom';
import { IconnedButton } from '..';

const PopupActions = ({ width, title, color, buttons, icon, position = "bottom center", trigger }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popup
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
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
