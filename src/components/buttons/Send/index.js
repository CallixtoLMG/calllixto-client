import { Button, Icon, Popup } from "semantic-ui-react";
import { ButtonContainer, ModalContainer } from "./styles";

const ButtonEdit = ({ page, element }) => {
  return (
    <Popup
      position='right center'
      trigger={<ButtonContainer><Button fluid color="blue" ><Icon name='send' />Enviar</Button></ButtonContainer>}
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

export default ButtonEdit;