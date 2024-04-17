import { APIS } from "@/constants";
import { Button, Icon, Popup } from "semantic-ui-react";
import { ButtonContainer, Container, MailButton } from "./styles";

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
        <Container>
          {customerData.phone &&
            <Button
              href={`${APIS.WSP((`${customerData.phone?.areaCode}${customerData.phone?.number}`), customerData.name)}`}
              color='green' size="tiny"><Icon name='whatsapp' />WhatsApp</Button>}
          {customerData.email &&
            <MailButton
              href={`${APIS.MAIL(customerData.email, customerData.name)}`}
              background="rgb(219,68,55)!important" size="tiny" ><Icon name='mail' />Mail
            </MailButton>
          }
        </Container>
      }
      on='click'
    />
  )
};

export default ButtonSend;
