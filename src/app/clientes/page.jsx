import { loadCustomers } from "@/apiCalls/customers";
import CustomersPage from "@/components/customers/CustomersPage";
import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function deleteCustomer(id) {

  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store",
  };

  await fetch(`${URL}${CLIENTID}${PATHS.CUSTOMERS}/${id}`, requestOptions)
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
    <CustomersPage customers={customers} />
  )
};

export default Customers;