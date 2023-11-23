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
              href={`https://api.whatsapp.com/send?phone=${customerData.phone}
              &text=${encodeURIComponent(`Hola estimado ${customerData.name}, aqui esta el presupuesto que nos has pedido!`
              )}`} color='green' size="tiny" ><Icon name='whatsapp' />WhatsApp</Button>}

          {customerData.email &&
            <Button
              href={`mailto:${customerData.email}
              ?Subject=${encodeURIComponent(`Hola estimado ${customerData.name}, aqui esta el presupuesto que nos has pedido!`
              )}`} color='green' size="tiny" ><Icon name='mail' />Mail</Button>}
        </ModalContainer>
      }
      on='click'
    />
  )
};

export default ButtonSend;