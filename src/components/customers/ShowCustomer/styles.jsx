import { Flex } from "rebass";
import { Label, Segment } from "semantic-ui-react";
import styled from "styled-components";

const ModLabel = styled(Label)({
  maxWidth: "50vh!important",
  margin: "0!important"
});

const ModSegment = styled(Segment)({
  maxWidth: "50vh!important",
  height: "50px!important",
});

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

export { HeaderContainer, ModLabel, ModSegment };

