import { Flex } from "rebass";
import { Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const Container = styled(Flex)`
  flex-direction: column;
  gap: 3px!important;
`;

const Button = styled(SButton)`
  margin: 0!important;
`;

const ButtonContainer = styled(Flex)`
  padding: 0!important;
  height: 36px!important;
`;

export { Button, ButtonContainer, Container };

