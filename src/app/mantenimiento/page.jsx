"use client";
import { COLORS, ICONS } from "@/common/constants";
import { Header, Icon } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled.main`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #fff;
  text-align: center;
`;

const WarningIcon = styled(Icon)`
  &&& {
    margin: 0 0 18px;
    font-size: 7rem;
  }
`;

const Title = styled(Header)`
  &&& {
    margin: 0;
    font-size: 2.75rem;
    line-height: 1.15;
  }
`;

const Maintenance = () => (
  <MainContainer>
    <WarningIcon color={COLORS.RED} name={ICONS.EXCLAMATION_CIRCLE} />
    <Title as="h1">Página en mantenimiento</Title>
  </MainContainer>
);

export default Maintenance;
