import { Flex } from "@/components/common/custom";
import { Popup as SPopup } from "semantic-ui-react";
import styled from "styled-components";

const PopupContent = styled(Flex)`
  flex-direction : row;
  justify-content : space-between;
  column-gap: 15px;
`;

const Popup = styled(SPopup)`
  z-index: 2!important;
`;

export {
  Popup, PopupContent
};

