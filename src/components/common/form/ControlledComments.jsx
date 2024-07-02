import { TextArea } from "@/components/common/custom";
import { Controller } from "react-hook-form";

export const ControlledComments = ({ control }) => {
  return (
    <Controller
      name="comments"
      control={control}
      render={({ field }) => (
        <TextArea
          {...field}
          maxLength="2000"
          placeholder="Comentarios"
        />
      )}
    />
  );
};
