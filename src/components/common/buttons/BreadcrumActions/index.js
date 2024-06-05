import { NoPrint } from '@/components/layout';
import { ButtonContent, Icon, Popup } from 'semantic-ui-react';
import { Button, ButtonContainer, Container } from "./styles";

const BreadcrumActions = ({ title, color, button, icon }) => {
  return (

    <Popup
      position='bottom center'
      trigger={
        <ButtonContainer>
          <Button animated='vertical' fluid color={color}>
            <ButtonContent hidden>{title}</ButtonContent>
            <ButtonContent visible>
              <Icon name={icon} />
            </ButtonContent>
          </Button>
        </ButtonContainer>
      }
      content={
        <NoPrint>
          <Container>
            {button}
          </Container>
        </NoPrint>
      }
      on='click'
    />
  );
};

export default BreadcrumActions
  ;
