import { Divider, FlexColumn } from '@/common/components/custom';
import OnCreate from './OnCreate';
import OnPrint from './OnPrint';
import General from './General';

const BudgetsModule = (() => {
  return (
    <FlexColumn>
      {/* <General />
      <Divider /> */}
      <OnCreate />
      <Divider />
      <OnPrint />
    </FlexColumn>
  )
})

export default BudgetsModule