import { Divider, FlexColumn } from "@/common/components/custom";
import BanProduct from "@/components/settings/Entities/Products/BanProducts";
import Tags from "../../Common/Tags";

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