
import { FormField } from "@/components/common/custom";
import { Controller } from "react-hook-form";
import { Dropdown } from "../../custom";

export const DropdownControlled = ({
  name,
  width,
  label,
  options = [],
  defaultValue,
  afterChange,
  disabled
}) => {
  return (
    <Controller
      name={name}
      render={({ field: { onChange, ...rest } }) => (
        <FormField
          {...rest}
          width={width}
          label={label}
          control={Dropdown}
          selection
          options={options}
          defaultValue={defaultValue}
          onChange={(e, { value}) => {
            onChange(value);
            afterChange?.(value);
          }}
          disabled={disabled}
        />
      )}
    />
  );
};


