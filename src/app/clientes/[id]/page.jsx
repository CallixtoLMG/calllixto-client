import { getCustomer } from "@/api/customers";
import ShowCustomer from "@/components/customers/ShowCustomer";

async function Customer({ params }) {
  const customer = await getCustomer(params.id);

  return (
    <ShowCustomer customer={customer.customer} id={params.id} />
  )
};

export default Customer;