import { NoPrint } from '@/components/layout';
import { ButtonContent, Icon, Popup } from 'semantic-ui-react';
import { Button, ButtonsContainer, Flex } from '../../custom';

const PopupActions = ({ width, title, color, buttons, icon, animated = true, position = "bottom center", trigger }) => {
  return (
    <Popup
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
            {buttons}
          </Flex>
        </NoPrint>
      }
      on="click"
    />
  );
};

export default PopupActions
  ;
