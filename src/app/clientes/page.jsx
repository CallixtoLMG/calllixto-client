import CustomersPage from "@/components/customers/CustomersPage";
import { toast } from "react-hot-toast";

export async function loadCustomers() {
  const res = await fetch("https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/customers", { cache: "no-store" });
  const data = await res.json()
  return data
};

export async function deleteCustomer(id) {

  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store",
  };

  await fetch(`https://t1k6ta4mzg.execute-api.sa-east-1.amazonaws.com/fe1af28f-b478-4d9e-b434-f4cf6e4355cc/customers/${id}`, requestOptions)
    .then(async response => {
      let res = await response.text()
      res = JSON.parse(res)
      if (res.statusOk) {
        toast.success("Cliente eliminado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};

async function Customers() {
  const customers = await loadCustomers()

  return (
    <CustomersPage customers={customers.customers} />
  )
};

export default Customers;