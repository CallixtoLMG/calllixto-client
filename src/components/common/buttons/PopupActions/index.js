import { NoPrint } from '@/components/layout';
import React, { useState } from 'react';
import { ButtonContent, Icon, Popup } from 'semantic-ui-react';
import { Button, ButtonsContainer, Flex } from '../../custom';

const PopupActions = ({ width, title, color, buttons, icon, animated = true, position = "bottom center", trigger }) => {
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
          <Button width={width} {...animated && { animated: 'vertical' }} color={color}>
            <ButtonContent hidden>{title}</ButtonContent>
            <ButtonContent visible>
              <Icon name={icon} />
            </ButtonContent>
          </Button>
        </ButtonsContainer>
      )}
      content={
        <NoPrint>
          <Flex rowGap="5px" flexDirection="column">
            {React.Children.map(buttons, (child) => 
              React.cloneElement(child, {
                onClick: () => {
                  handleClose();
                  if (child.props.onClick) {
                    child.props.onClick();
                  }
                }
              })
            )}
          </Flex>
        </NoPrint>
      }
      on="click"
    />
  );
};

export default PopupActions;
