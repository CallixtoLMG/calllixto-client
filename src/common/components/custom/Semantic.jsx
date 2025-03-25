import {
  Form,
  Button as SButton,
  Divider as SDivider,
  Dropdown as SDropdown,
  Icon as SIcon,
  Input as SInput,
  Label as SLabel,
  Menu as SMenu,
  Message as SMessage,
  MessageHeader as SMessageHeader,
  Modal as SModal,
  Segment as SSegment,
  TextArea as STextarea,
} from "semantic-ui-react";
import styled from "styled-components";

export const Segment = styled(SSegment)`
  height: ${({ height = 'auto' }) => height} !important;
  padding: ${({ height, padding }) => padding || (height && "10px")} !important;
  margin: ${({ margin = "0" }) => margin} !important;
  width: ${({ width = '100%' }) => width} !important;
  min-height: 35px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
  overflow: auto;
  align-content: center;
  opacity: ${({ show }) => show ? "0" : "1"} !important;
`;

export const Input = styled(SInput)`
  width: ${({ width = '100%' }) => `${width}!important`};
  height: ${({ height = '38px' }) => height} !important;
  text-align: ${({ textAlign }) => textAlign} !important;
`;

export const FormField = styled(Form.Field)`
  width: ${({ width = '100%' }) => `${width}!important`};
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  margin: ${({ margin = "0" }) => margin} !important;
  flex-direction: column;
  height: ${({ height }) => height} !important;

  .disabled {
    opacity: 1!important;
    input {
      opacity: 1 !important;
    }
  }
  label {
    opacity: 1 !important;
  }
`;

export const Label = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: ${({ height }) => height ? height : 'fit-content'} !important;
  margin: ${({ margin }) => margin ? margin : '0'} !important;
  padding: ${({ padding }) => padding} !important;
  align-content: center;
  opacity: ${({ show }) => show ? "0" : "1"} !important;
  font-weight: ${({ fontWeight }) => fontWeight} !important;
  box-shadow: ${({ fontWeight }) => fontWeight && "0 1px 2px 0 rgba(34,36,38,.15)"} !important;
`;

export const TextArea = styled(STextarea)`
  resize: ${({ resize = "none" }) => `${resize}!important`};
  padding: ${({ padding }) => `${padding}!important`};
`;

export const Dropdown = styled(SDropdown)`
  height: ${({ height = '35px' }) => `${height}!important`} ;
  padding: ${({ padding }) => `${padding}!important`} ;
  background-color: ${({ bgColor }) => `${bgColor}!important`};
  box-shadow: ${({ boxShadow }) => boxShadow && "0 1px 2px 0 rgba(34,36,38,.15)"} !important;
  i{
    margin-right: ${({ iconMargin }) => `${iconMargin}!important`}
  }
  ${({ multiple }) => multiple && `
    &&&&&& div.item {
      padding: 0.35rem 0.4rem!important;
      width: fit-content!important;
      background-color: white;
      font-size: 12px!important;
      &:hover {
        background-color: white;
      }
    }
    a.ui.label {
      font-size: 12px!important;
      padding: 0.5rem 0.8rem!important;
    }
  `}
`;

export const DropdownOption = styled(SDropdown)`
&&&&{
  padding-left: ${({ paddingLeft }) => paddingLeft}!important;
}
  justify-content: space-between!important;
  margin:0!important;
  font-size: 13.5px!important;
  padding: ${({ menu }) => menu ? "9px 10px" : "13px 10px"} !important ;
  width: ${({ width = '100%' }) => `${width}!important`} ;
  justify-content: space-between!important;
  align-content: center;
  margin:0!important;
  &::before {
    content:none!important;
  }
  i.dropdown.icon{
    margin-left: 5px!important;
  }
`;

export const DropdownItem = styled(SDropdown.Item)`
  font-size: 13.5px!important;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 400;
  width: 100%;
  &&&&&&{
    padding: 10px 10px!important;
  }
  &:hover {
    background-color: #f5f5f5!important;
    color: rgba(0, 0, 0, 0.87);
  };
  i{
    margin-right: 5px!important
  }
`;

export const Menu = styled(SMenu)`
  &&&{
    width:110px;
    height: 35px;
    min-height:35px;
    font-size: 13px!important;
    border:none;
  }
`;

export const DropdownMenu = styled(SDropdown.Menu)`
  left: 110%!important;
  &&&&{
    top: 2px!important;
  }
`;

export const Icon = styled(SIcon)`
  align-self: center!important;
  margin-right: ${({ marginRight }) => marginRight && `11px!important`} ;
  top: ${({ dollar, tooltip }) => (dollar ? `-3px` : tooltip ? `-2px` : 'initial')} !important;
  position: ${({ dollar, tooltip }) => (dollar || tooltip) && `relative!important`} ;
  font-size: ${({ fontSize }) => `${fontSize}!important`} ;
  margin: ${({ margin }) => `${margin}!important;`};
  cursor: ${({ pointer }) => pointer && "pointer"} !important;
  justify-items: ${({ justifyItems }) => `${justifyItems}!important;`};
  pointer-events: ${({ disablePointerEvents }) => (disablePointerEvents ? "none" : "all")} !important;
`;

export const Modal = styled(SModal)`
  width: ${({ width = '100%' }) => `${width}!important`} ;
  max-width: 90%!important;
  max-height: 90vh!important;
  min-height: ${({ minHeight = '100px' }) => `${minHeight}!important`} ;
`;

export const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

export const Message = styled(SMessage)`
  width: 100%;
  margin: ${({ margin }) => `${margin}!important`} ;
`;

export const Button = styled(SButton)`
  font-weight: 500 !important;
  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`} ;
    align-self: ${({ alignSelf }) => `${alignSelf}!important`} ;
    font-size: 13.5px !important;
    width: ${({ width = '110px' }) => `${width}!important`} ;
    padding-left: ${({ paddingLeft = '40px' }) => `${paddingLeft}!important`} ;
    padding: ${({ padding }) => padding && "0 18px 0 40px"}!important ;
    margin-right: 0;
    position: ${({ position }) => `${position}!important`} ;
  };
`;

export const Divider = styled(SDivider)`
  margin: 10px!important;
`;