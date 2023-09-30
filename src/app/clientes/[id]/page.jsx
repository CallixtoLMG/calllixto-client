import ShowCustomer from "@/components/customers/ShowCustomer";

async function loadCustomer(id) {
  const res = await fetch(`https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/f222ba6b-b1f9-4ed8-b264-79418f7dfc22/customers/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data;
};

async function Customer({ params }) {

  const customer = await loadCustomer(params.id);

  return (
    <ShowCustomer customer={customer} id={params.id} />
  )
};

export default Customer;