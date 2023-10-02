import CustomerForm from "@/components/customers/CustomerForm";

async function showCustomer(code) {
  const res = await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${code}`);
  const data = await res.json()
  return data
};

// async function editCustomer(id) {
//   var requestOptions = {
//     method: 'PUT',
//     redirect: 'follow',
//     Headers: {
//       'Content-type': 'application-json'
//     },
//     cache: "no-store",
//   };

//   await fetch(`https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/customers/${id}`, requestOptions)
//     .then(response => response.text())
//     .then(result => console.log(result))
//     .catch(error => console.log('error', error));
// };

async function EditProduct({ params }) {
  const customer = await showCustomer(params.id);

  return (
    <CustomerForm customer={customer} />
  )
};

export default EditProduct;