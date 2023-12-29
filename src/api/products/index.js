import { CLIENT_ID, CREATE_BATCH, EDIT_BATCH, PATHS, URL } from "@/fetchUrls";
import { now } from "@/utils";
import { toast } from "react-hot-toast";
import { omit } from "lodash";
import { baseCreate, baseDelete, baseGet, baseUpdate } from "../base";

const PRODUCTS_URL = `${URL}${CLIENT_ID}${PATHS.PRODUCTS}`;

export async function create(product) {
  baseCreate(PRODUCTS_URL, product, 'Producto creado!');
};

export async function edit(product) {
  baseUpdate(`${PRODUCTS_URL}/${product.code}`, omit(product, ["code", "createdAt"]), 'Producto actualizado!');
};

export async function deleteProduct(id) {
  baseDelete(`${PRODUCTS_URL}/${id}`, 'Producto eliminado!');
};

export async function list() {
  const { products } = await baseGet(PRODUCTS_URL);
  return products;
};

export async function getProduct(code) {
  const { product } = await baseGet(`${PRODUCTS_URL}/${code}`);
  return product;
};

export async function createBatch(product) {
  for (const prod of product.products) {
    prod.createdAt = now();
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

export async function editBatch(product) {
  for (const prod of product.update) {
    prod.updatedAt = now();
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
