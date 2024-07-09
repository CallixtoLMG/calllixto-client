import { NoPrint } from '@/components/layout';
import { ButtonContent, Icon, Popup } from 'semantic-ui-react';
import { Button, ButtonsContainer } from '../../custom';
import { Container } from "./styles";

const PopupActions = ({ title, color, buttons, icon, animated = true, position = "bottom center" }) => {
  return (
    <Popup
      position={position}
      trigger={
        <ButtonsContainer>
          <Button width="90px"  {...animated && { animated: 'vertical' }} fluid color={color}>
            <ButtonContent hidden>{title}</ButtonContent>
            <ButtonContent visible>
              <Icon name={icon} />
            </ButtonContent>
          </Button>
        </ButtonsContainer>
      }
      content={
        <NoPrint>
          <Container>
            {buttons}
          </Container>
        </NoPrint>
      }
      on="click"
    />
  );
};

export default PopupActions
  ;
