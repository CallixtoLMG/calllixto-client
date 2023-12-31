import { Flex } from "rebass";
import { Header as SHeader, Image as SImage, Segment as SSegment } from "semantic-ui-react";
import styled from "styled-components";

const CustomerDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
`;

const ClientDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
  justify-content: space-between;
`;

const HeaderContainer = styled(Flex)`
  flex-direction: row!important;
  justify-content: space-between;
  width: 100%;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 0px 0!important;
  width: ${({ width }) => width || '200px'} !important;
`;

const PayMethodContainer = styled(Flex)`
  margin-top: 18px!important;
  align-items: center;
`;

const Title = styled(SHeader)`
  margin: auto !important;
  color: rgba(235,124,21,255)!important;
`;

const Divider = styled.div`
  width: 100%;
  height: 3px;
  border-radius: 15px;
  background-color: rgba(0,152,57,255);
  margin: 20px 0;
`;

const Sign = styled.div`
  width: 30%;
  height: 3px;
  color: green;
  border-radius: 15px;
  background-color: rgba(0,152,57,255);
  margin-top: 70px;
`;

const SubtleLabel = styled(SLabel)`
  background-color: white !important;
  border: 0.5px solid grey !important;
`;

const Segment = styled(SSegment)`
  margin-top: 5px !important;
  height: 50px !important;
  box-shadow: 0 0 0 0 !important;
  background-color: white !important;
  border: 0.5px solid grey !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  padding: 8px !important;
`;

const Image = styled(SImage)`
  &&& {
    width: 250px!important;
    height: 100px!important;
  };
`;

const Header = styled(SHeader)`
  margin: 0 !important;
`;

const PayMethodsContainer = styled(Flex)`
  flex-wrap: wrap;
  row-gap: 5px;
  column-gap: 5px;
  margin-left: 15px !important;
`;

export { PayMethodsContainer, ClientDataContainer, CustomerDataContainer, DataContainer, Divider, HeaderContainer, Image, SubtleLabel, Segment, Title, PayMethodContainer, Sign, Header };

