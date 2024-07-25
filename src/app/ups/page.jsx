"use client";
import { useRouter } from 'next/navigation';
import { Button, Header, Icon } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const NotFound = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
    back();
  };
  return (
    <MainContainer>
      <Header as="h1" icon>
        <Icon color="red" name="exclamation circle" />
        Página no encontrada o no está autorizado!
      </Header>
      <Button
        icon
        labelPosition="left"
        onClick={handleClick}
        color="red"
      >
        <Icon name="arrow left" />
        Volver atrás
      </Button>
    </MainContainer>
  );
};

export default NotFound;