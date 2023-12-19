"use client"
import { useRouter } from 'next/navigation';
import { Button, Header, Icon } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const NotFoundPage = () => {
  const router = useRouter();
  const handleClick = () => {
    router.back();
    router.back();
  };
  return (
    <MainContainer>
      <Header as="h1" icon>
        <Icon color='red' name="exclamation circle" />
        Página no encontrada
        o no está autorizado!
      </Header>
      <Button onClick={handleClick} color='red'>Volver atrás</Button>
    </MainContainer>
  );
};

export default NotFoundPage;