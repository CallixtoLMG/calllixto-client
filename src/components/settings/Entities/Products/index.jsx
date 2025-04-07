import { Divider, FlexColumn } from "@/common/components/custom";
import BanProduct from "@/components/settings/Modules/BanProducts";
import Tags from "../../Modules/Tags";

const ProductsModule = (() => {

  return (
    <FlexColumn >
      <Tags />
      <Divider />
      <BanProduct />
    </FlexColumn>
  )
})

export default ProductsModule