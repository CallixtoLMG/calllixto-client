import {
  Form,
  Accordion as SAccordion,
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
  TextArea as STextarea
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
  border: ${({ $noBorder }) => $noBorder && "blue"} !important;
  box-shadow: ${({ $noBoxShadow }) => $noBoxShadow && "none"} !important;
`;

export const Input = styled(SInput)`
  width: ${({ width = '100%' }) => `${width}!important`};
  height: ${({ height = '38px' }) => height} !important;
  text-align: ${({ textAlign }) => textAlign} !important;
  &&& input{
    border-left: ${({ $iconLabel }) => ($iconLabel) && "none"} !important;
    justify-items: ${({ $justifyItems }) => $justifyItems} !important;
    padding: ${({ padding }) => padding} !important;
    opacity: ${({ disabled }) => disabled && "0.45"} !important;
  }
`;

export const FormField = styled(Form.Field)`
  width: ${({ $width = '100%' }) => $width};
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  margin: ${({ margin = "0" }) => margin} !important;
  flex-direction: ${({ $flexDirection = "column" }) => $flexDirection} !important;
  height: ${({ $height }) => $height} !important;
  row-gap: ${({ $rowGap }) => $rowGap} !important;
  column-gap: ${({ $columnGap = '15px' }) => $columnGap} !important;
  align-items: ${({ $alignItems }) => $alignItems} !important;
  justify-content: ${({ $justifyContent }) => $justifyContent} !important;
  min-width: ${({ $minWidth }) => $minWidth}!important;
  max-width: ${({ $maxWidth }) => $maxWidth}!important;
  align-self: ${({ $alignSelf }) => $alignSelf} !important;

  .disabled {
    opacity: 1!important;
    input {
      opacity: 1 !important;
    }
  }
  label {
    font-size: 14px !important;
    opacity: 1 !important;
    font-weight: bold;
  }
`;

export const Label = styled(SLabel)`
  width: ${({ width }) => width ? width : '100%'} !important;
  height: ${({ height }) => height ? height : 'fit-content'} !important;
  margin: ${({ margin }) => margin ? margin : '0'} !important;
  padding: ${({ padding }) => padding} !important;
  align-content: center;
  align-self: ${({ $alignSelf }) => $alignSelf} !important;
  opacity: ${({ show }) => show ? "0" : "1"} !important;
  font-weight: ${({ fontWeight }) => fontWeight} !important;
  box-shadow: ${({ fontWeight }) => fontWeight && "0 1px 2px 0 rgba(34,36,38,.15)"} !important;
  pointer-events: ${({ pointerEvents }) => pointerEvents} !important;
  z-index: ${({ $ZIndex }) => $ZIndex} !important;
`;

export const TextArea = styled(STextarea)`
  resize: ${({ resize = "none" }) => `${resize}!important`};
  padding: ${({ padding }) => `${padding}!important`};
`;

export const Dropdown = styled(SDropdown)`
  height: ${({ $dropdownHeight = '38px' }) => `${$dropdownHeight}!important`} ;
  padding: ${({ padding }) => `${padding}!important`} ;
  background-color: ${({ bgColor }) => `${bgColor}!important`};
  box-shadow: ${({ $boxShadow }) => $boxShadow && "0 1px 2px 0 rgba(34,36,38,.15)"} !important;
  width: ${({ width }) => `${width}!important`};

  &&& {
    opacity: ${({ disabled }) => disabled && "0.45"} !important;
    min-width: ${({ $minWidth }) => `${$minWidth}!important`};
  }
  
  .text{
    text-align: ${({ $textAlign }) => `${$textAlign}!important`};
    max-width: ${({ textMaxWidth }) => `${textMaxWidth}!important`};
  }

  .divider.text{
    padding-bottom: 2px;
  }

  .menu > .item,
  > .text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width:100%;
  }

  i{
    margin-right: ${({ iconMargin }) => `${iconMargin}!important`}
  }

  .disabled.selection-dropdown {
    color: red!important;
    opacity: .45!important;
  }
  
  ${({ multiple }) => multiple && `
    min-height: fit-content!important;
    &&&&&& div.item {
      min-height: fit-content!important;
      padding: 0.35rem 0.4rem!important;
      font-size: 12px!important;
      div{
        width: fit-content!important;
      }
    }
    div.divider.default.text{
      margin: 6px 0 5px 9px;
    }
    a.ui.label {
      font-size: 12px!important;
      padding: 0.5rem 0.8rem!important;
    }
    .menu > .item.selected,
    .menu > .item.active {
      background-color: rgba(0, 0, 0, .05)!important;
    }
  `}
`;

export const DropdownOption = styled(SDropdown)`
  flex-flow: ${({ $reverse }) => `${$reverse && "row-reverse"}!important`} ;
&&&&{
  padding-left: ${({ $paddingLeft }) => $paddingLeft}!important;
}
  justify-content: space-between!important;
  margin:0!important;
  font-size: 13.5px!important;
  font-weight: 500!important;
  padding: ${({ $menu }) => $menu ? "9px 10px" : "13px 10px"} !important ;
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
    padding: 12px 10px!important;
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
    box-shadow: none;
  }
`;

export const DropdownMenu = styled(SDropdown.Menu)`
  left: 110%!important;
  &&&&&&&{
    top: 2px!important;
    margin-right: 5px!important;
  }
`;

export const Icon = styled(SIcon)`
  align-self: center!important;
  align-content: ${({ $alignContent }) => `${$alignContent}!important`} ;
  margin-right: ${({ $marginRight }) => $marginRight && `11px!important`} ;
  top: ${({ $lowTooltip, $tooltip }) => ($lowTooltip ? `-3px` : $tooltip ? `-1px` : 'initial')} !important;
  position: ${({ $lowTooltip, $tooltip }) => ($lowTooltip || $tooltip) && `relative!important`} ;
  font-size: ${({ fontSize }) => `${fontSize}!important`} ;
  margin: ${({ margin }) => `${margin}!important;`};
  padding: ${({ padding }) => `${padding}!important;`};
  cursor: ${({ $pointer }) => $pointer && "pointer"} !important;
  justify-items: ${({ justifyItems }) => `${justifyItems}!important;`};
  pointer-events: ${({ disablePointerEvents }) => (disablePointerEvents ? "none" : "all")} !important;
  line-height: ${({ $lineHeight }) => `${$lineHeight}!important;`};
  height: ${({ $height }) => `${$height}!important;`};
  z-index:2!important;
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
  align-content: ${({ $alignContent }) => `${$alignContent}!important`} ;
  padding: ${({ padding }) => `${padding ? padding : "9.5px 14px"}!important`} ;
  height: ${({ height }) => `${height}!important`} ;
  height: ${({ height }) => `${height}!important`} ;
  width: ${({ width }) => `${width}!important`} ;
  min-width: ${({ $minWidth }) => `${$minWidth}!important`} ;
  margin: ${({ margin }) => `${margin}!important`} ;
  opacity: ${({ $opacity }) => `${$opacity && "0.45"}!important`} ;
`;

export const Button = styled(SButton)`
  font-weight: 500 !important;

  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`};
    margin-top: ${({ $marginTop }) => `${$marginTop}!important`};
    margin-bottom: ${({ $marginBottom }) => `${$marginBottom}!important`};
    align-self: ${({ $alignSelf }) => `${$alignSelf}!important`};
    font-size: ${({ $fontSize = '13.5px' }) => `${$fontSize}!important`};
    width: ${({ width = '110px' }) => `${width}!important`};
    margin-right: 0;
    position: ${({ position }) => `${position}!important`};
    position: ${({ $minWidth }) => `${$minWidth}!important`};

    padding: ${({ $iconOnly, padding }) =>
    $iconOnly
      ? `${padding || '0'}!important`
      : `${padding || '0 18px 0 40px'}!important`};

    ${({ $iconOnly, width = '35px', height = '35px' }) =>
    $iconOnly &&
    `
        min-width: ${width}!important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      `}
  }
`;

export const IconButton = styled(SButton)`
  font-weight: 500 !important;

  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`};
    margin-top: ${({ $marginTop }) => `${$marginTop}!important`};
    margin-bottom: ${({ $marginBottom }) => `${$marginBottom}!important`};
    align-self: ${({ $alignSelf }) => `${$alignSelf}!important`};
    font-size: ${({ $fontSize = '13.5px' }) => `${$fontSize}!important`};
    width: ${({ width = '110px' }) => `${width}!important`};
    margin-right: 0;
    position: ${({ position }) => `${position}!important`};

    padding: ${({ $iconOnly, padding }) =>
    $iconOnly
      ? `${padding || '0'}!important`
      : `${padding || '0 18px 0 40px'}!important`};

    ${({ $iconOnly, width = '35px', height = '35px' }) =>
    $iconOnly &&
    `
        min-width: ${width}!important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      `}
  }
`;

export const Divider = styled(SDivider)`
  margin: 10px!important;
`;

export const AccordionTitle = styled(SAccordion.Title)`
  padding-bottom: 0px!important;

  > i:first-child {
    transform: rotate(${({ $active }) => ($active ? "180deg" : "0deg")})!important;
    transition: transform 0.3s ease!important;
  }

`;
