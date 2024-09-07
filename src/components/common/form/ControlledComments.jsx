import { FormField, Label, TextArea } from "@/components/common/custom";
import { Controller } from "react-hook-form";

export const ControlledComments = ({ control, disabled }) => {
  return (
    <FormField width="100%">
      <Label>Comentarios</Label>
      <Controller
        name="comments"
        control={control}
        render={({ field }) => (
          <TextArea
            {...field}
            maxLength="2000"
            placeholder="Comentarios"
            disabled={disabled}  
          />
        )}
      />
    </FormField>
  );
};
