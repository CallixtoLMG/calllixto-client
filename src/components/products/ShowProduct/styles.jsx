import { Flex } from "rebass";
import { Label, Segment } from "semantic-ui-react";
import styled from "styled-components";

const ModLabel = styled(Label)({
  margin: "0!important"
});

const ModSegment = styled(Segment)({
  marginTop: "5px!important",
  height: "50px!important",
});

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const SubContainer = styled(Flex)`
  flex-direction: row;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: 250px!important;
`;

export { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer };

