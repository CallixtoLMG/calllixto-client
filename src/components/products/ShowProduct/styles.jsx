import { Flex } from "rebass";
import { Label, Segment } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModLabel = styled(Label)({
  maxWidth: "50vh!important",
  margin: "0!important"
});

const ModSegment = styled(Segment)({
  maxWidth: "50vh!important",
  height: "50px!important",
});

export {
  MainContainer, ModLabel, ModSegment
};

