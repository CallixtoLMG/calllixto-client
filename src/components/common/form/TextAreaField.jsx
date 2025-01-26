import { FormField, TextArea } from "@/components/common/custom";

export const TextAreaField = ({ width, label, placeholder, value }) => {
  return (
    <FormField
      control={TextArea}
      label={label}
      width={width}
      placeholder={placeholder ?? label}
      value={value}
    />
  );
};
