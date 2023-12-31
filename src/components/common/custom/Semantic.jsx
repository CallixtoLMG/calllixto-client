import { Form, Segment as SSegment, Input as SInput } from "semantic-ui-react";
import styled from "styled-components";

export const Segment = styled(SSegment)`
  margin: 5px 0!important;
  height: 50px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
`;

export const FormField = styled(Form.Field)`
  width: ${({ width }) => width || '200px!important'};
  min-width: ${({ minWidth }) => minWidth || "200px!important"};
  flex: ${({ flex }) => flex || 'none!important'};
  margin: 0 !important;
  flex-direction: column;
`;

export const Input = styled(SInput)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;
`;
