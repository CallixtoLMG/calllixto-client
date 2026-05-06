"use client";
import { COLORS, ICONS } from "@/common/constants";
import { Header, Icon } from "semantic-ui-react";
import { MainContainer } from "../ups/styles";

const Maintenance = () => (
  <MainContainer>

    <Header as="h1" icon>
      <Icon color={COLORS.RED} name={ICONS.EXCLAMATION_CIRCLE} />
      Página en mantenimiento
    </Header>

  </MainContainer>
);

export default Maintenance;
