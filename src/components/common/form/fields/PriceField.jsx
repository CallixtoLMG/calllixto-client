import { FormField, Input } from "@/components/common/custom";
import { formatedNumber } from "@/utils";
import { Icon } from "semantic-ui-react";

export const PriceField = ({ label, value, ...inputProps }) => {
  return (
    <FormField
      label={label}
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
