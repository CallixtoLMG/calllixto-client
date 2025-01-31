import { Flex, Label } from "@/components/common/custom";
import { CommentTooltip } from "@/components/common/tooltips";
import { getBrandCode, getProductCode, getSupplierCode } from "@/common/utils";
import { Popup } from "semantic-ui-react";
import { PriceLabel } from "../common/form";

export const ATTRIBUTES = {
  CODE: "code",
  NAME: "name",
  PRICE: "price",
  COMMENTS: "comments",
  BRAND_NAME: "brandName",
  SUPPLIER_NAME: "supplierName",
  EDITABLE_PRICE: "editablePrice",
  FRACTION_CONFIG: "fractionConfig",
  STATE: "state",
};

export const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Código",
    align: "left",
    width: 2,
    value: (product) =>
      <>
        <Popup
          size="tiny"
          content={product.supplierName}
          position="top center"
          trigger={<span>{getSupplierCode(product.code)}</span>}
        />&nbsp;
        <Popup
          size="tiny"
          content={product.brandName}
          position="top center"
          trigger={<span>{getBrandCode(product.code)}</span>}
        />&nbsp;
        <span>{getProductCode(product.code)}</span>
      </>
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (product) =>
      <Flex justifyContent="space-between">
        {product.name}
        {product.comments && <CommentTooltip comment={product.comments} />}
      </Flex>
  },
  {
    id: 3,
    title: "Precio",
    width: 2,
    value: (product) => <PriceLabel value={product.price} />,
  }
];

export const IMPORT_PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Código",
    width: 2,
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
  },
  {
    id: 3,
    title: "Precio",
    width: 2,
  },
  {
    id: 4,
    title: "Comentarios",
    align: "left",
  }
];

export const BAN_PRODUCTS_COLUMNS = [
  {
    id: 1,
    title: "Código",
    value: (product) =>
      product.code
  },
];

export const BAN_FILTERS = [
  { value: 'code', placeholder: 'Código' },
];

export const EXAMPLE_TEMPLATE_DATA = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

export const PRODUCT_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  DELETED: {
    id: 'DELETED',
    title: 'Eliminados',
    singularTitle: 'Eliminado',
    color: 'red',
    icon: 'ban',
  },
  OOS: {
    id: 'OOS',
    title: 'Sin stock',
    singularTitle: 'Sin stock',
    color: 'orange',
    icon: 'expired',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };
export const EMPTY_FILTERS = { code: '', name: '', state: PRODUCT_STATES.ACTIVE.id };

export const PRODUCT_STATES_OPTIONS = Object.values(PRODUCT_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));
