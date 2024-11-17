import {
  Form,
  Button as SButton,
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
  min-height: 50px!important;
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
  overflow: auto;
  align-content: center;
  opacity: ${({ show }) => show ? "0" : "1"} !important;
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
    width: ${({ innerWidth = '100%' }) => `${innerWidth}!important`};
    text-align-last: ${({ textAlignLast }) => `${textAlignLast}!important`};
  };
  div{
    line-height: 190%!important;
  };
`;

export const FormField = styled(Form.Field)`
  display:flex;
  width: ${({ width = '200px' }) => `${width}!important`};
  min-width: ${({ minWidth = '200px' }) => `${minWidth}!important`};
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  margin: ${({ margin = "0" }) => margin} !important;
  flex-direction: column;
  row-gap: 5px!important;
  max-height: ${({ maxHeight }) => `${maxHeight}!important`};
`;

export const Label = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: ${({ height }) => height ? height : 'fit-content'} !important;
  margin: ${({ margin }) => margin ? margin : '0'} !important;
  padding: ${({ padding }) => padding} !important;
  align-content: center;
  opacity: ${({ show }) => show ? "0" : "1"} !important;
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
  i{
    margin-right: ${({ iconMargin }) => `${iconMargin}!important`}
  }
  i.dropdown.icon {
    height: 50px!important;
    top: ${({ top = "15px" }) => `${top}!important`};
  };
  &:hover {
    background-color: ${({ noBgColor }) => `${noBgColor}!important`};
  };
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
    padding: 13px 10px!important;
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
  top: ${({ dollar, toast }) => (dollar ? `-3px` : toast ? `-2px` : 'initial')} !important;
  position: ${({ dollar, toast }) => (dollar || toast) && `relative!important`} ;
  font-size: ${({ fontSize }) => `${fontSize}!important`} ;
  margin: ${({ margin }) => `${margin}!important;`};
`;

export const Modal = styled(SModal)`
  width: ${({ width = '100%' }) => `${width}!important`} ;
  max-width: 90%!important;
  max-height: 90vh!important;
  min-height: ${({ minHeight = '100px' }) => `${minHeight}!important`} ;
`;

export const IconedButton = styled(SButton)`
  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`} ;
    font-size: 13.5px;
    width: ${({ width = '110px' }) => `${width}!important`} ;
    padding-left: ${({ paddingLeft = '40px' }) => `${paddingLeft}!important`} ;
    padding: ${({ padding }) => padding && "0 18px 0 40px"}!important ;
    margin-right: 0;
  };
`;

export const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

export const Message = styled(SMessage)`
  width: 100%;
`;