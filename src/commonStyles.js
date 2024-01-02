import { Flex } from "rebass";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  justify-content: center!important;
  width: 100%!important;
`;

const SubContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
  width: 80%!important;
  max-width: 1200px!important;
  padding-top: 50px!important;
`;

export {
  MainContainer, SubContainer
};
