import Link from "next/link";
import { Flex } from "rebass";
import styled from "styled-components";

const ModLink = styled(Link)({
  width: "fit-content",
});

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
`;

export { ButtonContainer, ModLink };

