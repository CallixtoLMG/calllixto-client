import styled from "styled-components";
import { Flex } from "rebass";

export const FormContainer = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
`;

export const FieldsContainer = styled(Flex)`
  justify-content: ${({ justifyContent }) => justifyContent };
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;
