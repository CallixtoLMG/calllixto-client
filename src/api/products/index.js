import { CLIENT_ID, CREATE_BATCH, EDIT_BATCH, PATHS, URL } from "@/fetchUrls";
import { createDate } from "@/utils";
import { toast } from "react-hot-toast";
import { omit } from "lodash";
import { baseCreate } from "../base";

const PRODUCTS_URL = `${URL}${CLIENT_ID}${PATHS.PRODUCTS}`;

export async function create(product) {
  baseCreate(PRODUCTS_URL, product, 'Producto creado!');
};

export async function createBatch(product) {
  for (const prod of product.products) {
    prod.createdAt = createDate();
    prod.supplier = "supplier"
    prod.brand = "brand"
  }
  var requestOptions = {
    method: "POST",
    body: JSON.stringify(product),
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };
  fetch(`${PRODUCTS_URL}/${CREATE_BATCH}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Productos importados exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}

export async function edit(product) {
  product.updatedAt = createDate();
  const validParams = omit(product, ["code", "createdAt"]);
  const requestOptions = {
    body: JSON.stringify(validParams),
    method: "PUT",
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  fetch(`${PRODUCTS_URL}/${product.code}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Producto modificado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}

export async function editBatch(product) {
  for (const prod of product.update) {
    prod.updatedAt = createDate();
  }
  const requestOptions = {
    body: JSON.stringify(product),
    method: "POST",
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  fetch(`${PRODUCTS_URL}/${EDIT_BATCH}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Productos modificados exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}

export async function productsList(requestOptions) {
  const res = await fetch(PRODUCTS_URL, requestOptions);
  const data = await res.json();
  return data.products;
}

export async function getProduct(code, requestOptions) {
  const res = await fetch(`${PRODUCTS_URL}/${code}`, requestOptions);
  const data = await res.json();
  return data.product;
}

export async function deleteProduct(code) {
  var requestOptions = {
    method: "DELETE",
    redirect: "follow",
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    cache: "no-store",
  };

  await fetch(`${PRODUCTS_URL}/${code}`, requestOptions)
    .then(async (response) => {
      let res = await response.text();
      res = JSON.parse(res);
      if (res.statusOk) {
        toast.success("Producto eliminado exitosamente");
      } else {
        toast.error(res.message);
      }
    })
    .catch((error) => console.log("error", error));
}
