import { FormField, Icon, Input, Label } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { Popup } from "semantic-ui-react";

export const TextField = ({
  flex,
  width,
  label,
  placeholder,
  iconLabel,
  value,
  disabled,
  onChange,
  onKeyPress,
  maxLength,
  error,
  showPopup = false,
  popupContent = "top center",
  popupPosition
}) => {
  const showIconLabel = () => (
    <Label width="fit-content" height="100%">
      {showPopup ? (
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
      ) : null}
      {iconLabel}
    </Label>
  );

  return (
    <FormField flex={flex} width={width} label={label} control={Input} error={error}>
      <Input
        placeholder={placeholder ?? label}
        {...(iconLabel && { labelPosition: 'left' })}
        value={value}
        disabled={disabled}
        onChange={onChange}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
      >
        {iconLabel && showIconLabel()}
        <input />
      </Input>
    </FormField>
  );
};
