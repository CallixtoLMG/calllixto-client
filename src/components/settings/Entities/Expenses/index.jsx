import { FlexColumn } from "@/common/components/custom";
import { Divider } from "@/common/components/custom/Semantic";
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

