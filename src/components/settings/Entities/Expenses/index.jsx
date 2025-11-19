import { FlexColumn } from "@/common/components/custom";
import { Divider } from "@/common/components/custom/Semantic";
import Categories from "../../Common/Categories";
import Tags from "../../Common/Tags";

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

