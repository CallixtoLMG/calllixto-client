import { Flex } from "rebass";
import { Button as SButton, Segment as SSegment, Table as STable } from "semantic-ui-react";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  flex-direction: row;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: 200px!important;
`;

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

const Segment = styled(SSegment)`
  margin-top: 5px!important;
  height: 50px!important;
`;

export { DataContainer, Button, Segment, SubContainer };

