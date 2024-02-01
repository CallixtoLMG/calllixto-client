import { Flex } from "rebass";
import { Popup as SPopup } from "semantic-ui-react";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  padding: 0!important;
  height: 36px!important;
  max-width: 90px!important;
`;

const PopupContent = styled(Flex)`
  flex-direction : row;
  justify-content : space-between;
  column-gap: 15px;
`;

const Popup = styled(SPopup)`
  z-index: 2!important;
`;

export {
  ButtonContainer, Popup, PopupContent
};

