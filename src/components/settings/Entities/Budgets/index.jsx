import { useListCustomers } from "@/api/customers";
import { Divider, FlexColumn } from '@/common/components/custom';
import { CUSTOMER_STATES } from "@/components/customers/customers.constants";
import { useMemo } from "react";
import OnCreate from './OnCreate';
import OnPrint from './OnPrint';

const BudgetsModule = (() => {

  const { data: customersData, isLoading: loadingCustomers } = useListCustomers();

  const customerOptions = useMemo(() => customersData?.customers?.map(customer => ({
    state: customer.state,
    id: customer.id,
    key: customer.id,
    value: customer.id,
    text: customer.name,
  }))?.filter(({ state }) => state === CUSTOMER_STATES.ACTIVE.id), [customersData]);

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