import { CLIENT_ID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";
import { createDate } from "@/utils";
import { omit } from "lodash";
import { baseCreate, baseUpdate } from "../base";

const SUPPLIER_URL = `${URL}${CLIENT_ID}${PATHS.SUPPLIERS}`;

export async function create(supplier) {
  baseCreate(SUPPLIER_URL, supplier, 'Proveedor creado!');
};

export async function edit(supplier) {
  baseUpdate(`${SUPPLIER_URL}/${supplier.id}`, omit(supplier, ["id", "createdAt"]), 'Proveedor actualizado!');
};

export async function suppliersList(requestOptions) {
  const res = await fetch(SUPPLIER_URL, requestOptions);
  const data = await res.json();
  return data.suppliers;
};

export async function getSupplier(id, requestOptions) {
  const res = await fetch(`${SUPPLIER_URL}/${id}`, requestOptions);
  const data = await res.json();
  return data.supplier;
};

export async function deleteSupplier(id) {
  var requestOptions = {
    method: 'DELETE',
    redirect: 'follow',
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    },
    cache: "no-store",
  };

  await fetch(`${SUPPLIER_URL}/${id}`, requestOptions)
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



