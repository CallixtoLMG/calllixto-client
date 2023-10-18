import { Flex } from "rebass";
import { Input } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin-left: 12px!important;
  flex-direction: row!important
`;

const ModInput = styled(Input)`
  align-self: center!important
  max-height: 36px!important;
    > input  {
    padding: 6px!important;
    }
`;

export {
  MainContainer, ModInput
};

