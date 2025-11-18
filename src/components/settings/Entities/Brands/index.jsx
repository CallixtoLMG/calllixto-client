import { useFormContext } from "react-hook-form";
import Tags from "../../Common/Tags";

const BrandsModule = (() => {
  const { control } = useFormContext();

  return (
    <Tags control={control} />
  )
})

export default BrandsModule