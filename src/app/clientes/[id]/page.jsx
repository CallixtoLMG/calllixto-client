import ShowCustomer from "@/components/customers/ShowCustomer";

async function loadCustomer(id) {
  const res = await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/customers/${id}`, { cache: "no-store" });
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