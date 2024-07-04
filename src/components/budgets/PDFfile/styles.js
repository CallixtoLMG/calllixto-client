import { Flex } from "rebass";
import { Header as SHeader, Image as SImage, Label as SLabel, Segment as SSegment, Table } from "semantic-ui-react";
import styled from "styled-components";

const SectionContainer = styled(Flex)`
  justify-content: space-between;
  min-height: 35px;
  align-items: center;

  & > * {
    flex: 1;
  }
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  width: ${({ width }) => width} !important;
`;

const Title = styled(SHeader)`
  margin: 0!important;
  color: ${({ color }) => color ? "rgba(235,124,21,255)" : "black"}!important;
  align-content: center;
  align-self: center;
  text-decoration: ${({ cancelled }) => cancelled ? 'line-through' : 'none' } ;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: ${({ $borderless }) => $borderless ? "0px solid grey" : " 1px solid grey"} !important;
`;

const Image = styled(SImage)`
  &&& {
    height: 40px!important;
  };
`;

const Segment = styled(SSegment)`
  min-height: ${({ minHeight }) => minHeight || ""};
  margin-top: ${({ marginTop }) => marginTop || "5px"} !important;
  box-shadow: 0 0 0 0 !important;
  background-color: white !important;
  border: 0.5px solid grey !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  padding: ${({ padding = '0 5px' }) => padding} !important;
  line-height: 28px!important;
  `;

const HeaderLabel = styled(SLabel)`
  background-color: white!important;
  margin: 0!important;
  padding: 3px 0!important;
  font-size: 14px!important;
`;

const Label = styled(SLabel)`
  border: 0.5px solid grey!important;
  border-bottom-left-radius: 0!important;
  border-bottom-right-radius: 0!important;
  margin: 0!important;
  margin-bottom: -1px!important;
  height: 30px!important;
  padding: 0 5px!important;
  line-height: 30px!important;
`;

export { DataContainer, Divider, HeaderLabel, Image, Label, SectionContainer, Segment, Title };

