import CustomersPage from "@/components/customers/CustomersPage";

async function loadCustomers() {
  const res = await fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers", { cache: "no-store" });
  const data = await res.json()
  return data
};

export async function deleteCustomer(code) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store",
  };

  await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${code}`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
};

export async function editCustomer(code) {
  var requestOptions = {
    method: 'PUT',
    redirect: 'follow',
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store",
  };

  await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${code}`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
};

async function Customers() {
  const customers = await loadCustomers()

  return (
    <CustomersPage customers={customers} />
  )
};

export default Customers;