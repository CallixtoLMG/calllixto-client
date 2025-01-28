import { FormField, Input } from "@/components/common/custom";
import { formatedNumber } from "@/utils";
import { Icon } from "semantic-ui-react";

export const PriceField = ({ label, width, value, ...inputProps }) => {
  return (
    <FormField
      label={label}
      width={width}
      control={Input}
    >
      <Input
        {...inputProps}
        value={formatedNumber(value)}
        readOnly
        iconPosition="left"
      >
        <Icon name="dollar" />
        <input />
      </Input>
    </FormField>
  );
};
