import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function create(brand) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(brand),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store"
  };

  fetch(`${URL}${CLIENTID}${PATHS.BRANDS}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Marca creada exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch(error => console.log('error', error));
};

export async function edit({ id, brand }) {
  const requestOptions = {
    body: JSON.stringify(brand),
    method: 'PUT',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store",
  };

  fetch(`${URL}${CLIENTID}${PATHS.BRANDS}/${id}`, requestOptions)
    .then(async response => {
      let res = await response.text()
      res = JSON.parse(res)
      if (res.statusOk) {
        toast.success("Marca modificada exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch(error => console.log('error', error));
};

export async function brandsList(requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BRANDS}`, requestOptions);
  const data = await res.json();
  return data.brands;
};

export async function getBrand(id, requestOptions) {
  const res = await fetch(`${URL}${CLIENTID}${PATHS.BRANDS}/${id}`, requestOptions);
  const data = await res.json();
  return data.brand;
};

export async function deleteBrand(id) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store",
  };

  await fetch(`${URL}${CLIENTID}${PATHS.BRANDS}/${id}`, requestOptions)
    .then(async response => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Marca eliminada exitosamente");
      } else {
        toast.error(res.message);
      };
    })
    .catch(error => console.log('error', error));
};



