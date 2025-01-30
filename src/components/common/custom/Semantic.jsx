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
  width: ${({ width = '100%' }) => `${width}!important`};
  height: ${({ height = '38px' }) => height} !important;
  text-align: ${({ textAlign }) => textAlign} !important;

  &&& .disabled {
    opacity: 1 !important;
    input {
      opacity: 0.8 !important;
    }
  }
`;

export const FormField = styled(Form.Field)`
  width: ${({ width = '100%' }) => `${width}!important`};
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  margin: ${({ margin = "0" }) => margin} !important;
  flex-direction: column;
  height: ${({ height }) => height} !important;
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
  color: red;
  background-color: red m !important;
  &&&&& {
    opacity: 1 !important;
    textarea {
      opacity: 0.1 !important;
    }
  }
`;

export const Dropdown = styled(SDropdown)`
  height: ${({ height = '35px' }) => `${height}!important`} ;
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

export const MessageHeader = styled(SMessageHeader)`
  font-size: 15px!important;
`;

export const Message = styled(SMessage)`
  width: 100%;
`;

export const Button = styled(SButton)`
  font-weight: 500 !important;
  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`} ;
    font-size: 13.5px !important;
    width: ${({ width = '110px' }) => `${width}!important`} ;
    padding-left: ${({ paddingLeft = '40px' }) => `${paddingLeft}!important`} ;
    padding: ${({ padding }) => padding && "0 18px 0 40px"}!important ;
    margin-right: 0;
  };
`;