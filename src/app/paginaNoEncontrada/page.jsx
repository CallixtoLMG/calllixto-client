"use client"
import { useRouter } from 'next/navigation';
import { Button, Header, Icon } from 'semantic-ui-react';
import { NotFoundWrapper } from "./styles";

const NotFound = () => {
  const router = useRouter();
  const handleClick = () => {
    router.back()
  };
  return (
    <NotFoundWrapper>
      <Header as="h1" icon>
        <Icon color='red' name="exclamation circle" />
        Página no encontrada
      </Header>
      <Button onClick={handleClick} color='red'>Volver Atrás</Button>
    </NotFoundWrapper>
  );
};

export default NotFound;