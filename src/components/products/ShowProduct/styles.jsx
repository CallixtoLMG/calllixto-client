import { Flex } from "rebass";
import { Label as SLabel, Segment as SSegment } from "semantic-ui-react";
import styled from "styled-components";

const Label = styled(SLabel)`
  width: 100%!important;
`;

const SubContainer = styled(Flex)`
  justify-content: ${(props) => props.jContent || "normal"};
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

const ButtonsContainer = styled(Flex)`
  width: fit-content!important;
  align-self: self-end;
`;

const Segment = styled(SSegment)`
  margin: 5px 0!important;
  height: 50px!important;
`;

const Container = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
`;

const DataContainer = styled(Flex)`
  width: ${(props) => props.width || '200px!important'};
  min-width: ${(props) => props.minWidth || "200px!important"};
  flex: ${(props) => props.flex || 'none!important'};
  margin: 0!important;
  flex-direction: column;
`;

export { ButtonsContainer, Container, DataContainer, Label, Segment, SubContainer };



