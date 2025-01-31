import { FormField, Input } from "@/components/common/custom";
import { getFormatedNumber } from "@/common/utils";
import { Icon } from "semantic-ui-react";

export const PriceField = ({ label, width, value, disabled = true, ...inputProps }) => {
  return (
    <FormField
      label={label}
      width={width}
      control={Input}
    >
      <Input
        {...inputProps}
        value={getFormatedNumber(value)}
        readOnly={disabled}
        iconPosition="left"
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
