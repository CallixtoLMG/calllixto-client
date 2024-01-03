import { Flex } from "rebass";
import { Form as SForm } from "semantic-ui-react";
import styled from "styled-components";

export const Form = styled(SForm)`
  display: flex !important;
  flex-direction: column !important;
  row-gap: 15px !important;
`;

export const FieldsContainer = styled(Flex)`
  justify-content: ${({ justifyContent }) => justifyContent};
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

export const ButtonsContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 10px !important;
  justify-content: flex-end;
  column-gap: 10px;
`;
