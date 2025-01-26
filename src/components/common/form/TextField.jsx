import { FormField, Input } from "@/components/common/custom";

export const TextField = ({ width, flex, label, placeholder, value }) => {
  return (
    <FormField
      flex={flex}
      width={width}
      label={label}
      placeholder={placeholder ?? label}
      control={Input}
      value={value}
      readOnly
    />
  );
};
