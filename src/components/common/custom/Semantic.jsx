import {
  Form,
  Button as SButton,
  Checkbox as SCheckbox,
  Dropdown as SDropdown,
  Icon as SIcon,
  Input as SInput,
  Label as SLabel,
  Modal as SModal,
  Segment as SSegment,
  TextArea as STextarea
} from "semantic-ui-react";
import styled from "styled-components";

export const Segment = styled(SSegment)`
  height: ${({ height }) => height && height} !important;
  padding:${({ height }) => height && "10px"} !important;
  margin: 5px 0!important;
  width: ${({ width }) => width ? width : "100%"} !important;
  min-height: 50px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
  overflow: auto;
`;

export const Input = styled(SInput)`
  margin: ${({ margin }) => margin || "5px 0"} !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: ${({ height }) => height || '50px'} !important;
  width: ${({ width }) => width ? width : ''} !important;
  display: flex!important;
  input{
    height: ${({ height }) => height || '50px'} !important;
    padding: 0 14px!important;
    text-align: ${({ center }) => center && 'center'} !important;
  };
  div{
    line-height: 190%!important;
  }
`;

export const Checkbox = styled(SCheckbox)`
  label::after{
    z-index: 1!important;
  };
`;

export const FormField = styled(Form.Field)`
  width: ${({ width }) => width || '200px'} !important;
  min-width: ${({ minWidth }) => minWidth || "200px"} !important;
  flex: ${({ flex }) => flex || 'none'} !important;
  margin: 0 !important;
  flex-direction: column;
`;

export const Label = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: fit-content;
  margin: 0!important;
`;

export const TextArea = styled(STextarea)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15)!important;
  border-radius: 0.28571429rem;
  resize: ${({ readonly }) => readonly && 'none'} !important;
`;

export const Dropdown = styled(SDropdown)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15)!important;
  border-radius: 0.28571429rem!important;
  height: ${({ height }) => height || '50px'} !important;
  min-height: ${({ minHeight }) => minHeight || 'none'} !important;
  display: flex!important;
  flex-wrap: wrap;
  align-content: center;
  input {
    height: ${({ height }) => height || '50px'} !important;
  };
  i.dropdown.icon {
    height: 50px!important;
    top: ${({ top }) => top || "15px"} !important;
  };
`;

export const Button = styled(SButton)`
  width: ${({ width }) => width ? width : ''} !important;
  margin: 0 !important;
`;

export const Icon = styled(SIcon)`
  align-self: center!important;
`;

export const Modal = styled(SModal)`
  width: ${({ width }) => width || '100%'} !important;
  max-width: 90%!important;
  max-height: 90vh!important;
  min-height: ${({ minHeight }) => minHeight || '100px'} !important;
`;
