"use client"
import { PAGES } from '@/constants';
import { useRouter } from 'next/navigation';
import { Button, Header, Icon } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const NotFoundPage = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push(PAGES.PRODUCTS.BASE)
  };
  return (
    <MainContainer>
      <Header as="h1" icon>
        <Icon color='red' name="exclamation circle" />
        Página no encontrada
        o no posee autorización!
      </Header>
      <Button onClick={handleClick} color='red'>Volver a productos</Button>
    </MainContainer>
  );
};

export default NotFoundPage;