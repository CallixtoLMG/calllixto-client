import { Flex } from "rebass";
import { Button as SButton, Segment as SSegment } from "semantic-ui-react";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  flex-direction: row;
  column-gap: 20px;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: ${({ width }) => width || '300px'} !important;
`;

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

const Segment = styled(SSegment)`
  margin-top: 5px!important;
  height: 40px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
  padding: 10px !important;
`;

export { Button, DataContainer, Segment, SubContainer };

