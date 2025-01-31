import { FlexColumn } from "@/components/common/custom";
import { Divider } from "@/components/common/custom/Semantic";
import Categories from "../../Modules/Categories";
import Tags from "../../Modules/Tags";

const ExpensesModule = (() => {

  return (
    <FlexColumn >
      <Tags />
      <Divider />
      <Categories />
    </FlexColumn>
  )
})

export default ExpensesModule

