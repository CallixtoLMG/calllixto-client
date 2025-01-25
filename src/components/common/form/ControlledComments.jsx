import { FormField, TextArea } from "@/components/common/custom";
import { Controller, useFormContext } from "react-hook-form";

export const ControlledComments = ({ disabled }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name="comments"
      control={control}
      render={({ field }) => (
        <FormField
          {...field}
          control={TextArea}
          label="Comentarios"
          width="100%"
          maxLength="2000"
          placeholder="Comentarios"
          disabled={disabled}
        />
      )}
    />
  );
};
