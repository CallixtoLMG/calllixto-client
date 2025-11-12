import { Form as SForm } from "semantic-ui-react";
import styled from "styled-components";
import { Flex } from "./Flex";

export const Form = styled(SForm)`
  display: flex !important;
  flex-direction: ${({ flexDirection = "column" }) => flexDirection} !important;
  row-gap: ${({ rowGap = "15px" }) => rowGap} !important;
  column-gap: ${({ columnGap }) => columnGap} !important;
  .field > label {
    margin: ${({ margin }) => margin} !important;
    font-size: ${({ fontSize }) => fontSize} !important;
  }
`;

export const ViewContainer = styled(Flex)`
  flex-direction: column;
  row-gap: 15px;
`;

export const FieldsContainer = styled(Flex)`
  justify-content: ${({ $justifyContent }) => $justifyContent};
  flex-wrap: wrap;
  column-gap: ${({ $columnGap = '15px' }) => $columnGap} !important;
  row-gap: ${({ $rowGap = 'auto' }) => $rowGap} !important;
  width: ${({ width = 'auto' }) => width} !important;
  min-height: ${({ $minHeight = 'auto' }) => $minHeight} !important;
  height: ${({ height = 'auto' }) => height} !important;
  align-items: ${({ $alignItems = 'auto' }) => $alignItems} !important;
`;

export const ButtonsContainer = styled(Flex)`
  flex-direction: row;
  margin-top: ${({ $marginTop }) => ($marginTop ? $marginTop : '0')};
  justify-content: flex-end;
  column-gap: 10px;
  padding: 0!important;
  width: ${({ width = 'auto' }) => width} !important;
`;

export const PhoneContainer = styled(Flex)`
  flex-wrap: ${({ wrap }) => wrap && 'wrap'};
  width: 100%;
  column-gap: 15px;
`;
