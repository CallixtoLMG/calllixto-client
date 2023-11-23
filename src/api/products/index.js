import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function create(product) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(product),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store"
  };
  console.log(requestOptions)

  fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Producto creado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch(error => console.log('error', error));
};

export async function edit(params, product) {
  const requestOptions = {
    body: JSON.stringify(product),
    method: 'PUT',
    redirect: 'follow',
    headers: {
      'Content-Type': 'application-json'
    },
    cache: "no-store",
  };

  fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}/${params}`, requestOptions)
    .then(async response => {
      let res = await response.text()
      res = JSON.parse(res)
      if (res.statusOk) {
        toast.success("Producto modificado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch(error => console.log('error', error));
};

export async function productsList() {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}`, { cache: "no-store" });
  const data = await res.json()
  return data.products
};

export async function getProduct(code) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}/${code}`);
  const data = await res.json()
  return data
};

export async function deleteProduct(code) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store"
  };

  await fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}/${code}`, requestOptions)
    .then(async response => {
      let res = await response.text()
      res = JSON.parse(res)
      if (res.statusOk) {
        toast.success("Producto eliminado exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};



