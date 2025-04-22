import { FormField, Icon, Input, Label, OverflowWrapper } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { useState } from "react";
import { Popup } from "semantic-ui-react";
import styled, { css } from "styled-components";

const TruncateInput = styled.div`
  width: 100%;
  height: 38px;
  padding: 9.5px 14px;
  border: 1px solid #d4d4d5;
  border-radius: 4px;
  background-color: #f9f9f9;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  font-family: Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  opacity: 0.45;
`;

const StyledLabel = styled(Label)`
  ${({ $hasError, $isFocused }) => css`
    border: 1px solid
      ${$hasError
      ? 'rgb(224, 180, 180)!important'
      : $isFocused
        ? '#85b7d9!important'
        : '#d4d4d5'}; 
    border-radius: 4px;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 8px;
    margin: 0;
  `}
`;

export const TextField = ({
  flex,
  width,
  label,
  placeholder,
  iconLabel,
  value,
  disabled,
  onChange,
  onKeyDown,
  maxLength,
  error,
  showPopup = false,
  popupContent,
  popupPosition = "top center",
  readOnly
  textAlign
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showIconLabel = () => (
    <StyledLabel
      $hasError={!!error}
      $isFocused={isFocused}
      width="fit-content"
      height="100%"
    >
      {showPopup && (
        <Popup
          position={popupPosition}
          size="tiny"
          content={popupContent}
          trigger={
            <Icon
              margin="0"
              name={ICONS.INFO_CIRCLE}
              color={COLORS.BLUE}
            />
          }
        />
      )}
      {iconLabel}
    </StyledLabel>
  );

  return (
    <FormField
      flex={flex}
      width={width}
      label={label}
      control={Input}
      error={error}
    >
      {disabled ? (
        <Input
          value={value}
          disabled
          labelPosition={iconLabel ? 'left' : undefined}
          textAlign={textAlign}
        >
          {iconLabel && showIconLabel()}
          <TruncateInput>
            <OverflowWrapper popupContent={value} maxWidth="100%">
              {value}
            </OverflowWrapper>
          </TruncateInput>
        </Input>
      ) : (
        <Input
          placeholder={placeholder ?? label}
          {...(iconLabel && { labelPosition: 'left' })}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          iconLabel={iconLabel}
          showPopup={showPopup}
        >
          {iconLabel && showIconLabel()}
          <input />
        </Input>
      )}
    </FormField>
  );
};