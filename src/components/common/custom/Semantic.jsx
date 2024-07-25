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
import styled, { css } from "styled-components";

export const Segment = styled(SSegment)`
  height: ${({ height = 'auto' }) => height} !important;
  padding:${({ height }) => height && "10px"} !important;
  margin: ${({ margin = "0" }) => margin} !important;
  width: ${({ width = '100%' }) => width} !important;
  min-height: 50px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
  overflow: auto;
  align-content: center;
`;

export const Input = styled(SInput)`
  margin: ${({ $marginBottom }) => $marginBottom && "5px 0"} !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  max-width: ${({ $maxWidth }) => $maxWidth && `200px!important;`};
  height: ${({ height = '50px' }) => height} !important;
  width: ${({ width = '100%' }) => `${width}!important`};
  display: flex!important;
  input{
    height: ${({ height }) => height || '50px'} !important;
    padding: 0 14px!important;
    text-align: ${({ center }) => (center ? 'center' : 'left')} !important;
  };
  div{
    line-height: 190%!important;
  }
`;

export const Checkbox = styled(SCheckbox)`
  height: ${({ height }) => height} !important;
  align-self: ${({ center }) => center && "center!important"};
  ${({ customColors }) => customColors && css`
  label{
    display:flex;
    aling-self:center;
  };
    &&& {
      input:focus:checked~label:before {
      background-color: ${customColors.true}!important;
      }
    };
    label::before{
      background-color: ${customColors.false}!important;
    };
    label::after{
      z-index: 1!important;
    };
  `};
`;

export const FormField = styled(Form.Field)`
  display:flex;
  width: ${({ width = '200px' }) => `${width}!important`};
  min-width: ${({ minWidth = '200px' }) => `${minWidth}!important`};
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  margin: ${({ margin = "0" }) => margin} !important;
  flex-direction: column;
  row-gap: 5px!important;
`;

export const Label = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: ${({ height }) => height ? height : 'fit-content'} !important;
  margin: ${({ margin }) => margin ? margin : '0'} !important;
  padding: ${({ padding }) => padding && padding} !important;
  align-content: center;
`;

export const ActionLabel = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: ${({ height }) => height ? height : 'fit-content'} !important;
  margin: ${({ margin }) => margin ? margin : '0'} !important;
  align-content: center;
  cursor: pointer;
  user-select: none;
`;

export const TextArea = styled(STextarea)`
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15)!important;
  border-radius: 0.28571429rem;
  resize: ${({ resize = "none" }) => `${resize}!important`};
  width: ${({ width }) => `${width}!important`};
  padding: ${({ padding }) => `${padding}!important`};
`;

export const Dropdown = styled(SDropdown)`
  padding: ${({ padding }) => `${padding}!important`};
  min-width: ${({ minWidth }) => `${minWidth}!important;`};
  max-width: ${({ $maxWidth }) => $maxWidth && `200px!important;`};
  margin: ${({ margin }) => `${margin}!important;`};
  box-shadow: ${({ hideBorder }) => hideBorder ? "none" : "0 1px 2px 0 rgba(34,36,38,.15) !important"};
  border-radius: ${({ hideBorder }) => hideBorder ? "0" : "0.28571429rem !important"};
  background-color: ${({ bgColor }) => `${bgColor}!important`};
  height: ${({ height = "50px" }) => `${height}!important`};
  min-height: ${({ minHeight }) => `${minHeight}!important`};
  display: flex!important;
  flex-wrap: wrap;
  align-content: center;
  width: ${({ width = "100%" }) => `${width}!important`};
  input {
    min-width: ${({ minWidth }) => `${minWidth}!important;`};
    height: ${({ height = "50px" }) => `${height}!important`};
  };
  i.dropdown.icon {
    height: 50px!important;
    top: ${({ top = "15px" }) => `${top}!important`};
  };
`;

export const Button = styled(SButton)`
  padding: ${({ padding }) => padding && padding} !important;
  display:flex;
  width: ${({ width = "120px" }) => width && width} !important;
  margin: 0 !important;
  height: ${({ height = "35px" }) => height && height} !important;
`;

export const Icon = styled(SIcon)`
  align-self: center!important;
`;

export const Modal = styled(SModal)`
  width: ${({ width = '100%' }) => `${width}!important`} ;
  max-width: 90%!important;
  max-height: 90vh!important;
  min-height: ${({ minHeight = '100px' }) => `${minHeight}!important`} ;
`;
