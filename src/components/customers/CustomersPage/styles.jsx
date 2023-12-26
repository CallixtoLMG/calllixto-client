import Link from "next/link";
import { Flex } from "rebass";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

export { ButtonContainer, ModLink };

