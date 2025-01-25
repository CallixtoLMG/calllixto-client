

import { FormField, Input } from "@/components/common/custom";
import { Icon } from "semantic-ui-react";

export const PriceField = ({ label, value, ...inputProps }) => {
  return (
    <FormField
      label={label}
      control={Input}
    >
      <Input
        {...inputProps}
        value={value}
        readOnly
        iconPosition='left'
      >
        <Icon name='dollar' />
        <input />
      </Input>
    </FormField>
  );
};




