import { customersList } from "@/api/customers";
import CustomersPage from "@/components/customers/CustomersPage";

async function Customers() {
  const customers = await customersList();

  return (
    <CustomersPage customers={customers} />
  )
};

export default Customers;