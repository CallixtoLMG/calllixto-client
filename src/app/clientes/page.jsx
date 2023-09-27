import CustomersPage from "@/components/customers/CustomersPage";

async function loadCustomers() {
  const res = await fetch("https://v1zcj5c6i3.execute-api.sa-east-1.amazonaws.com/f222ba6b-b1f9-4ed8-b264-79418f7dfc22/customers", { cache: "no-store" });
  const data = await res.json()
  return data
};

async function Customers() {
  const customers = await loadCustomers()

  return (
    <CustomersPage customers={customers} />
  )
};

export default Customers;