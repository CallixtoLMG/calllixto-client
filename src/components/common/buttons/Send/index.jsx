import { APIS } from "@/constants";
import { Button as SButton, Icon, Popup } from "semantic-ui-react";
import { ButtonContainer, MailButton, Button, ModalContainer } from "./styles";

const ButtonSend = ({ customerData }) => {
  return (
    <Popup
      position='right center'
      trigger={
        <ButtonContainer>
          <Button fluid color="blue">
            <Icon name='send' />
            Enviar
          </Button>
        </ButtonContainer>}
      content={
        <ModalContainer>
          {customerData.phone &&
            <SButton
              href={`${APIS.WSP((`${customerData.phone.areaCode}${customerData.phone.number}`), customerData.name)}`}
              color='green' size="tiny"><Icon name='whatsapp' />WhatsApp</SButton>}
          {customerData.email &&
            <MailButton
              href={`${APIS.MAIL(customerData.email, customerData.name)}`}
              background="rgb(219,68,55)!important" size="tiny" ><Icon name='mail' />Mail
            </MailButton>
          }
        </ModalContainer>
      }
      on='click'
    />
  )
};

export default ButtonSend;
