import { useFormContext } from "react-hook-form";
import Tags from "../../Common/Tags";

const SuppliersModule = (() => {
  const { control } = useFormContext();

  return (
    <Tags control={control} />
  )
})

export default SuppliersModule