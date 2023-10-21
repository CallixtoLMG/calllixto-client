import { Flex } from "rebass";
import { Input } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin-left: 12px!important;
  flex-direction: row!important
`;

// const ModInput = styled(Input)`
//   opacity: 0;
//   width: 0;
//   height: 0;
// `;

const ModInput = styled(Input)`
  // opacity: 0!important;
  // width: 0!important;
  // height: 0!important;
  align-self: center!important;
  max-height: 36px!important;
    > input  {
    padding: 6px!important;
    }
`;

export {
  MainContainer, ModInput
};

