import ShowCustomer from "@/components/customers/ShowCustomer";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";

async function loadCustomer(id) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function Customer({ params }) {

  const customer = await loadCustomer(params.id);

  return (
    <ShowCustomer customer={customer.customer} id={params.id} />
  )
};

export default Customer;