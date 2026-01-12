import { useListCustomers } from "@/api/customers";
import { Divider, FlexColumn } from '@/common/components/custom';
import { CUSTOMER_STATES } from "@/components/customers/customers.constants";
import { useMemo } from "react";
import OnCreate from './OnCreate';
import OnPrint from './OnPrint';

const BudgetsModule = (() => {
  
  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();

  const customers = useMemo(() => customersData?.customers, [customersData]);

  const customerOptions = useMemo(() => {
    return customers?.filter(({ state }) => state === CUSTOMER_STATES.ACTIVE.id);
  }, [customers]);
  
  return (
    <FlexColumn>
      {/* <General />
      <Divider /> */}
      <OnCreate customerOptions={customerOptions} isLoading={loadingCustomers} />
      <Divider />
      <OnPrint />
    </FlexColumn>
  )
})

export default BudgetsModule