import { NoPrint } from '@/components/layout';
import { cloneElement, useState } from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
import { Box, ButtonsContainer, Flex } from '../../custom';

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
          <Button
            size="small"
            icon
            labelPosition="left"
            width={width}
            color={color}
          >
            <Icon name={icon} />{title}
          </Button>
        </ButtonsContainer>
      )}
      content={
        <NoPrint>
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
        </NoPrint>
      }
      on="click"
    />
  );
};

export default PopupActions;
