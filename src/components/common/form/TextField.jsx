import { FormField, Input } from "@/components/common/custom";

export const TextField = ({ width, label, placeholder, value }) => {
  return (
    <FormField
      width={width}
      label={label}
      placeholder={placeholder ?? label}
      control={Input}
      value={value}
      readOnly
    />
  );
};
