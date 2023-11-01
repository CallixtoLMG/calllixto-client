import { Button, Icon, Popup } from "semantic-ui-react";
import { ButtonContainer, ModButton, ModalContainer } from "./styles";

const ButtonSend = () => {
  return (
    <Popup
      position='right center'
      trigger={
        <ButtonContainer>
          <ModButton fluid color="blue" >
            <Icon name='send' />
            Enviar
          </ModButton>
        </ButtonContainer>}
      content={
        <ModalContainer>
          <Button color='green' size="tiny" ><Icon name='whatsapp' />WhatsApp</Button>
          <Button color='green' size="tiny" ><Icon name='mail' />Mail</Button>
        </ModalContainer>
      }
      on='click'
    />
  )
};

export default ButtonSend;