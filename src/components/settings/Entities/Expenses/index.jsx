import { FlexColumn } from "@/components/common/custom";
import { Divider } from "semantic-ui-react";
import Categories from "../../Modules/Categories";
import Tags from "../../Modules/Tags";

const ExpensesModule = (() => {

  return (
    <FlexColumn >
      <Tags />
      <Divider />
      <Categories />
      <Divider />
      <Categories />
      <Divider />
      <Categories />
      <Divider />
      <Categories />
    </FlexColumn>
  )
})

export default ExpensesModule

