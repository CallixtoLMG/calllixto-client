import { APIS } from "@/constants";
import { Button, Icon, Popup } from "semantic-ui-react";
import { ButtonContainer, ModButton, ModalContainer } from "./styles";

const ButtonSend = ({ customerData }) => {
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
          {customerData.phone &&
            <Button
              href={`${APIS.WSP(customerData.phone, customerData.name)}`}
              color='green' size="tiny" ><Icon name='whatsapp' />WhatsApp</Button>}
          {customerData.email &&
            <Button
              href={`${APIS.MAIL(customerData.email, customerData.name)}`}
              color='green' size="tiny" ><Icon name='mail' />Mail</Button>}
        </ModalContainer>
      }
      on='click'
    />
  )
};

export default ButtonSend;