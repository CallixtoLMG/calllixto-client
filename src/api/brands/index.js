import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { createDate } from "@/utils";
import { toast } from "react-hot-toast";
import { omit } from "lodash";
import { baseCreate } from "../base";

const BRANDS_URL = `${URL}${CLIENT_ID}${PATHS.BRANDS}`;

export async function create(brand) {
  baseCreate(BRANDS_URL, brand, 'Marca creada!');
};

export async function edit(brand) {
  brand.updatedAt = createDate()
  const validParams = omit(brand,["id", "createdAt"])
  const requestOptions = {
    body: JSON.stringify(validParams),
    method: 'PUT',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store",
  };

  fetch(`${BRANDS_URL}/${brand.id}`, requestOptions)
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
  const res = await fetch(BRANDS_URL, requestOptions);
  const data = await res.json();
  return data.brands;
};

export async function getBrand(id, requestOptions) {
  const res = await fetch(`${BRANDS_URL}/${id}`, requestOptions);
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

  await fetch(`${BRANDS_URL}/${id}`, requestOptions)
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



