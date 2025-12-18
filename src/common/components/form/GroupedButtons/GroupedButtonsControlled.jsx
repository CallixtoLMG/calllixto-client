import { IconedButton } from "@/common/components/buttons";
import { SIZES } from "@/common/constants";
import { Controller } from "react-hook-form";
import { ButtonGroup } from "semantic-ui-react";
import { FormField } from "../../custom";

export const GroupedButtonsControlled = ({ name, label, width, buttons, color }) => {
  return (
    <Controller
      name={name}
      render={({ field: { onChange, value: formValue, ...rest } }) => (
        <FormField $width={width} label={label} control={ButtonGroup}>
          <ButtonGroup size={SIZES.SMALL}>
            {buttons?.map(({ text, icon, value }) => (
              <IconedButton
                {...rest}
                key={value}
                color={color}
                text={text}
                icon={icon}
                basic={formValue !== value}
                onClick={() => {
                  onChange(value);
                }}
              />
            ))}
          </ButtonGroup>
        </FormField>
      )}
    />
  );
}
