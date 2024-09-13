"use client";
import { IconnedButton } from '@/components/common/buttons';
import { COLORS, ICONS } from "@/constants";
import { useRouter } from 'next/navigation';
import { Header, Icon } from 'semantic-ui-react';
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
        <Icon color={COLORS.RED} name="exclamation circle" />
        Página no encontrada o no está autorizado!
      </Header>
      <IconnedButton text="Volver atrás" icon={ICONS.ARROW_LEFT} color={COLORS.RED} onClick={handleClick} />
    </MainContainer>
  );
};

export default NotFound;