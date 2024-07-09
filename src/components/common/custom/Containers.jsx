import { Form as SForm } from "semantic-ui-react";
import styled from "styled-components";
import { Flex } from "./Flex";

export const Form = styled(SForm)`
  display: flex !important;
  flex-direction: column !important;
  row-gap: 15px !important;
`;

export const ViewContainer = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
`;

export const FieldsContainer = styled(Flex)`
  justify-content: ${({ justifyContent }) => justifyContent};
  flex-wrap: wrap;
  column-gap: ${({ columnGap = '15px' }) => columnGap } !important;
  row-gap: ${({ rowGap = 'auto' }) => rowGap} !important;
  width: ${({ width = 'auto' }) => width} !important;
  min-height: ${({ minHeight = 'auto' }) => minHeight} !important;
  height: ${({ height = 'auto' }) => height} !important;
  align-items: ${({ alignItems = 'auto' }) => alignItems} !important;
`;

export const ButtonsContainer = styled(Flex)`
  flex-direction: row;
  margin-top: ${({ marginTop }) => (marginTop ? marginTop : '0')};
  justify-content: ${({ center }) => (center ? 'center' : 'flex-end')};
  column-gap: 5px;
  width: ${({ width }) => (width ? width : 'auto')}!important;
  padding: 0!important;
  height: ${({ height = 'auto' }) => height} !important;
`;

export const PhoneContainer = styled(Flex)`
  flex-wrap: ${({ wrap }) => wrap && 'wrap'};
  width: 100%;
  column-gap: 15px;
`;
