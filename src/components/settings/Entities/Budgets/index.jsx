import { Divider, FlexColumn } from '@/common/components/custom';
import General from './General';
import OnCreate from './OnCreate';
import OnPrint from './OnPrint';

const BudgetsModule = (() => {
  return (
    <FlexColumn>
      <General />
      <Divider />
      <OnCreate />
      <Divider />
      <OnPrint />
    </FlexColumn>
  )
})

export default BudgetsModule