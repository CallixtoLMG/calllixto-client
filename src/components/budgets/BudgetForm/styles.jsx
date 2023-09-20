import { Flex } from "rebass";
import { Button } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModButton = styled(Button)({
  marginTop: "14px!important",
})

const Label = styled.label`
  font-size: 14px!important;
  margin-left: 15px!important;
`;
export { Label, MainContainer, ModButton };

