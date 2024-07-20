import { Flex } from '@/components/common/custom';
import { Header as SHeader, Image as SImage } from "semantic-ui-react";
import styled from "styled-components";

const SectionContainer = styled(Flex)`
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: space-between;
  min-height: ${({ minHeight = '35px' }) => minHeight};
  align-items: ${({ alignItems = "center" }) => alignItems};

  & > * {
    flex: 1;
  }
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  grid-row-gap: 5px;
  width: ${({ width }) => width} !important;
`;

const Title = styled(SHeader)`
  margin: 0!important;
  color: ${({ color }) => color ? "rgba(235,124,21,255)" : "black"} !important;
  align-content: center;
  align-self: ${({ alignSelf = "center" }) => alignSelf} !important;
  text-align: ${({ textAlign }) => textAlign || "left"} !important;
  text-decoration: ${({ cancelled }) => cancelled ? 'line-through' : 'none'};
  width: ${({ width }) => width || "auto"}!important;
  font-weight: ${({ slim }) => slim ? 'normal' : "bold"} !important;
  min-height: ${({ minHeight }) => minHeight || ""};
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: ${({ $borderless }) => $borderless ? "0px solid grey" : " 1px solid grey"} !important;
`;

const Image = styled(SImage)`
  &&& {
    height: 50px!important;
  };
`;

export { DataContainer, Divider, Image, SectionContainer, Title };

