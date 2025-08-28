import { Flex, Label, OverflowWrapper } from "@/common/components/custom";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { Popup } from "semantic-ui-react";
import { PriceLabel } from "../../common/components/form";
import { getBrandCode, getProductCode, getSupplierCode } from "./products.utils";

export const LIST_PRODUCTS_QUERY_KEY = "listProducts";
export const LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY = "listProductsBySupplier";
export const GET_PRODUCT_QUERY_KEY = "getProduct";
export const PRODUCTS_FILTERS_KEY = "productsFilters";

export const ATTRIBUTES = {
  CODE: "code",
  NAME: "name",
  PRICE: "price",
  COMMENTS: "comments",
  BRAND_NAME: "brandName",
  SUPPLIER_NAME: "supplierName",
  EDITABLE_PRICE: "editablePrice",
  FRACTION_CONFIG: "fractionConfig",
  PREVIOUS_VERSIONS: "previousVersions",
  STATE: "state",
  COST: "cost",
  TAGS: "tags",
  INACTIVE_REASON: "inactiveReason",
};

export const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Código",
    key: "code",
    sortable: true,
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
      </>,
    sortValue: (product) => product.code?.toLowerCase() ?? ""
  },
  {
    id: 2,
    title: "Nombre",
    key: "name",
    align: "left",
    sortable: true,
    value: (product) => {
      const { tags, name, comments } = product;
      return (
        <Flex $justifyContent="space-between" $alignItems="center">
          <OverflowWrapper maxWidth="50vw" popupContent={name}>
            {name}
          </OverflowWrapper>
          <Flex $columnGap="7px" $alignItems="center" $justifyContent="flex-end">
            {tags && <TagsTooltip maxWidthOverflow="8vw" tooltip="true" tags={tags} />}
            {comments && <CommentTooltip tooltip="true" comment={comments} />}
          </Flex>
        </Flex>
      );
    },
    sortValue: (product) => product.name ?? ""

  },
  {
    id: 3,
    title: "Precio",
    width: 2,
    key: "price",
    sortable: true,
    value: (product) => <PriceLabel value={product.price} />,
    sortValue: (product) => product.price ?? ""
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
  ['Codigo', 'Nombre', 'Costo', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 100, 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 200, 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 300, 400, 'Comentarios...'],
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

export const EMPTY_PRODUCT = { name: '', cost: 0, price: 0, code: '', comments: '', supplierId: '', brandId: '' };
export const EMPTY_FILTERS = { code: '', name: '', state: PRODUCT_STATES.ACTIVE.id };

export const PRODUCT_STATES_OPTIONS = Object.values(PRODUCT_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

export const MEASSURE_UNITS = {
  MT: {
    key: 'mt',
    value: 'mt',
    text: 'Metros',
  },
  KG: {
    key: 'kg',
    value: 'kg',
    text: 'Kilogramos',
  },
};

export const FIELD_LABELS = {
  name: "Nombre",
  comments: "Comentario",
  state: "Estado",
  fractionConfig: "Medida",
  tags: "Etiquetas",
  editablePrice: "Precio editable",
  price: "Precio",
  cost: "Costo",
};

export const PRODUCT_LABELS = {
  NO_MEASURE: "Sin medida",
  NO_TAGS: "Sin etiquetas",
  NO_NAME: "Sin nombre",
  NO_COMMENT: "Sin comentario",
};

export const getLabel = (key) => FIELD_LABELS[key] ?? key;