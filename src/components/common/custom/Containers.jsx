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
  width: ${({ width }) => width || ''} !important;
`;

export const ButtonsContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 10px !important;
  margin-top: ${({ marginTop }) => marginTop};
  justify-content: flex-end;
  column-gap: 10px;
  width: ${({ width }) => width};
`;

export const PhoneContainer = styled(Flex)`
  column-gap: 10px;
`;
