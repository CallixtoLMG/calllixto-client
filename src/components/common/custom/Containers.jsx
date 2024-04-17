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
  min-height: ${({ minHeight }) => minHeight || ''} !important;
  height: ${({ height }) => height || ''} !important;
`;

export const ButtonsContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 10px !important;
  margin-top: ${({ marginTop }) => marginTop};
  justify-content: ${({ center }) => center ? "center" : "flex-end"};
  column-gap: 10px;
  width: ${({ width }) => width};
`;

export const PhoneContainer = styled(Flex)`
  width: 100%;
  column-gap: 10px;
`;
