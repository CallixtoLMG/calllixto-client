import { Controller } from "react-hook-form";
import { ButtonGroup, FormField } from "semantic-ui-react";
import { IconedButton } from "@/components/common/buttons";

export const GroupedButtonsControlled = ({ name, width, buttons }) => {
  return (
    <Controller
      name={name}
      render={({ field: { onChange, value: formValue, ...rest } }) => (
        <FormField width={width}>
          <ButtonGroup size="small">
            {buttons?.map(({ text, icon, value }) => (
              <IconedButton
                {...rest}
                key={value}
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
