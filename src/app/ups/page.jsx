"use client";
import { IconedButton } from '@/components/common/custom';
import { useRouter } from 'next/navigation';
import { Header, Icon } from 'semantic-ui-react';
import { MainContainer } from "./styles";
import { IconnedButton } from '@/components/common/buttons';

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
      <IconnedButton text="Volver atrás" icon="arrow left" color="red" onClick={handleClick} />
    </MainContainer>
  );
};

export default NotFound;