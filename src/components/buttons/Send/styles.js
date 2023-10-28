import { Flex } from "rebass";
import { Button } from "semantic-ui-react";
import styled from "styled-components";


const ModalContainer = styled(Flex)`
  flex-direction: row;
`;

const ModButton = styled(Button)({
  width: "170px!important",
  padding: "10px 0!important",
});

const ButtonContainer = styled(Flex)`
  width: 180px!important;
  padding: 0!important;
`;

export { ButtonContainer, ModButton, ModalContainer };

