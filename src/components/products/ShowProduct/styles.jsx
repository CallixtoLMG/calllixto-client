import { Flex } from "rebass";
import { Label as SLabel, Segment as SSegment } from "semantic-ui-react";
import styled from "styled-components";

const Label = styled(SLabel)`
  width: 100%!important;
`;

const SubContainer = styled(Flex)`
  flex-direction: row!important;
  justify-content: space-between;
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

const Segment = styled(SSegment)`
  margin-top: 5px!important;
  height: 50px!important;
`;

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const Container = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
`;

const DataContainer = styled(Flex)`
  width: ${(props) => props.width || '200px!important'};
  max-width: ${(props) => props.maxWidth || "300px!important"};
  min-width: 50px!important;
  flex: ${(props) => props.flex || '1!important'};
  margin: 0!important;
  flex-direction: column;
`;

export { Container, DataContainer, HeaderContainer, Label, Segment, SubContainer };



