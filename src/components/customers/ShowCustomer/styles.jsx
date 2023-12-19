import { Flex } from "rebass";
import { Label, Segment } from "semantic-ui-react";
import styled from "styled-components";

const ModLabel = styled(Label)({
  margin: "0!important",
  width: "100%!important"
});

const ModSegment = styled(Segment)({
  marginTop: "5px!important",
  height: "50px!important",
  margin: "1rem 0!important",
});

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

const SubContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
  width: 350px!important;
  align-self: center;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  width:100%!important;
`;

export { DataContainer, HeaderContainer, ModLabel, ModSegment, SubContainer };


