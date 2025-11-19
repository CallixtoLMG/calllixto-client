import { Divider, FlexColumn } from '@/common/components/custom';
import CreateBudget from './CreateBudget';
import PrintBudget from './PrintBudget';

const BudgetsModule = (() => {
  return (
    <FlexColumn>
      <CreateBudget />
      <Divider />
      <PrintBudget />
    </FlexColumn>
  )
})

export default BudgetsModule