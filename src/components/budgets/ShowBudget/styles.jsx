import { Flex } from "rebass";
import { Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  flex-direction: row;
  column-gap: 20px;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 10px 0!important;
  width: ${({ width }) => width || '300px'} !important;
`;

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin-left: 10px!important;
`;

export { Button, DataContainer, SubContainer };

