import { Flex } from "rebass";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px!important;
  margin-left: 15px!important;
`;

export { Label, MainContainer };
