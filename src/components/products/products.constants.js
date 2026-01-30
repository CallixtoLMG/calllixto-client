import { Box, Flex, FlexColumn, Icon, Label, OverflowWrapper } from "@/common/components/custom";
import { Text } from "@/common/components/form/Search/styles";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, DATE_FORMATS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { Popup } from "semantic-ui-react";
import { PriceLabel } from "../../common/components/form";
import { formatProductId, getBrandId, getProductId, getSupplierId } from "./products.utils";

export const LIST_PRODUCTS_QUERY_KEY = "listProducts";
export const LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY = "listProductsBySupplier";
export const GET_PRODUCT_QUERY_KEY = "getProduct";
export const PRODUCTS_FILTERS_KEY = "productsFilters";
export const MAIN_KEY = 'id';

export const LIST_ATTRIBUTES = [
  "id",
  "state",
  "name",
  "brandName",
  "supplierName",
  "cost",
  "price",
  "comments",
  "tags",
  "editablePrice",
  "fractionConfig",
  "inactiveReason",
  "stock",
  "stockControl",
];

export const ATTRIBUTES = {
  NAME: "name",
  COMMENTS: "comments",
  STATE: "state",
  EDITABLE_PRICE: "editablePrice",
  PRICE: "price",
  COST: "cost",
  FRACTION_CONFIG: "fractionConfig",
  TAGS: "tags",
  INACTIVE_REASON: "inactiveReason",
}

export const PRODUCT_COLUMNS = [
  {
    id: 1,
    title: "Id",
    key: "id",
    sortable: true,
    align: "left",
    width: 2,
    value: (product) =>
      <>
        <Popup
          size={SIZES.TINY}
          content={product.supplierName}
          position="top center"
          trigger={<span>{getSupplierId(product.id)}</span>}
        />&nbsp;
        <Popup
          size={SIZES.TINY}
          content={product.brandName}
          position="top center"
          trigger={<span>{getBrandId(product.id)}</span>}
        />&nbsp;
        <span>{getProductId(product.id)}</span>
      </>,
    sortValue: (product) => product.id?.toLowerCase() ?? ""
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
    id: 4,
    title: "Stock",
    key: "stock",
    sortable: true,
    width: 1,
    value: (product) => (product?.stock || 0),
    sortValue: (product) => product.stock ?? ""
  },
  {
    id: 5,
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
    title: "Id",
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
    title: "Id",
    value: (product) =>
      product.id
  },
];

export const BAN_FILTERS = [
  { value: 'id', placeholder: 'Id' },
];

export const EXAMPLE_TEMPLATE_DATA = [
  ['Id', 'Nombre', 'Costo', 'Precio', 'Comentarios'],
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

export const EMPTY_PRODUCT = { name: '', cost: 0, price: 0, id: '', comments: '', supplierId: '', brandId: '' };
export const EMPTY_FILTERS = { id: '', name: '', state: PRODUCT_STATES.ACTIVE.id };

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

export const getProductSearchTitle = (product) => (
  <OverflowWrapper $lineClamp={3} popupContent={product.name} maxWidth="100%">
    {product.name}
  </OverflowWrapper>
);

export const getProductSearchDescription = (product) => (
  <FlexColumn $marginTop="5px" $rowGap="5px">
    <FlexColumn>
      <Text>Id: {formatProductId(product.id)}</Text>
      <Text>Precio: {getFormatedPrice(product?.price)}</Text>
    </FlexColumn>
    <Flex
      width="100%"
      $justifyContent="space-between"
      height="20px"
      $marginTop="auto"
      $columnGap="5px"
      $alignItems="center"
    >
      <Flex $columnGap="7px">
        {product.state === PRODUCT_STATES.OOS.id && (
          <Label width="fit-content" size={SIZES.TINY} color={COLORS.ORANGE}>
            Sin Stock
          </Label>
        )}
        {product.tags && (
          <TagsTooltip maxWidthOverflow="5vw" tooltip="true" tags={product.tags} />
        )}
      </Flex>
      <Box width="fit-content">
        {product.comments ? (
          <CommentTooltip comment={product.comments} />
        ) : (
          <Box visibility="hidden" />
        )}
      </Box>
    </Flex>
  </FlexColumn>
);


export const EMPTY_STOCK_FILTERS = {
  type: "all",
  invoiceNumber: "",
  comments: "",
};

export const STOCK_TYPE_OPTIONS = [
  {
    key: "all",
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Todos&nbsp;
      </Flex>
    ),
    value: "all",
  },
  {
    key: "in",
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Ingresos&nbsp;
        <Icon name={ICONS.ARROW_DOWN} color={COLORS.GREEN} />
      </Flex>
    ),
    value: "in",
  },
  {
    key: "out",
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        Egresos&nbsp;
        <Icon name={ICONS.ARROW_UP} color={COLORS.RED} />
      </Flex>
    ),
    value: "out",
  },

];

export const STOCK_TABLE_HEADERS = [
  {
    id: 1,
    title: 'Fecha de Pago',
    key: "date",
    sortable: true,
    sortValue: (stockFlows) => stockFlows.createdAt ?? "",
    value: (stockFlows) => (
      <Flex whiteSpace="nowrap" $alignItems="center" >
        < Label ribbon width="fit-content" color={stockFlows.isInflow ? COLORS.GREEN : COLORS.RED} >
          <Icon inverted name={stockFlows.isInflow ? ICONS.ARROW_DOWN : ICONS.ARROW_UP} />
        </Label>
        <Box width="100%">
          {stockFlows.date
            ? getFormatedDate(stockFlows.createdAt, DATE_FORMATS.DATE_WITH_TIME)
            : "-"}
        </Box>
      </Flex>
    ),
    width: 2,
  },

  {
    id: 2,
    key: "quantity",
    sortable: true,
    sortValue: (stockFlows) => stockFlows.quantity ?? "",
    width: 2,
    title: 'Cantidad', value: (stockFlows) => stockFlows.quantity
  },
  {
    id: 3,
    key: "createdBy",
    sortable: true,
    sortValue: (stockFlows) => stockFlows.createdBy ?? "",
    width: 2,
    title: 'Creado por', value: (stockFlows) => stockFlows.createdBy
  },
  {
    id: 4,
    width: 3,
    title: 'N° Factura', value: (stockFlows) => stockFlows.invoiceNumber
  },
  {
    id: 5,
    width: 9,
    align: "left",
    title: 'Comentarios', value: (stockFlows) => <OverflowWrapper maxWidth="30vw" popupContent={stockFlows.comments}> {stockFlows.comments} </OverflowWrapper>
  },
];

export const LIST_PAYMENTS_QUERY_KEY = 'listPayments';
export const GET_PAYMENT_QUERY_KEY = 'getPayments';
export const PAYMENTS_FILTERS_KEY = 'paymentsFilters';

export const LIST_STOCK_FLOWS_QUERY_KEY = 'listStockFlows';
export const GET_STOCK_FLOW_QUERY_KEY = 'getStockFlows';
export const STOCK_FLOWS_FILTERS_KEY = 'expensesStockFlows';

export const EMPTY_STOCK = () => ({
  amount: '',
  comments: '',
  date: new Date(),
  invoiceNumber: '',
});

export const STOCK_FLOWS_MODAL_CONFIG = {
  add: {
    title: "Ingreso de stock",
    icon: ICONS.ARROW_DOWN,
    color: COLORS.GREEN,
    confirmText: "Agregar",
  },
  out: {
    title: "Egreso de stock",
    icon: ICONS.ARROW_UP,
    color: COLORS.RED,
    confirmText: "Agregar",
  },
  edit: {
    title: "Editar ingreso",
    icon: ICONS.EDIT,
    color: COLORS.BLUE,
    confirmText: "Actualizar",
  },
  delete: {
    icon: ICONS.TRASH,
    color: COLORS.RED,
    confirmText: "Eliminar",
  },
};

export const getStockFlowsListPopupContent = (stockFlows) => {
  return (
    <>
      <div>{`Creado por ${stockFlows?.createdBy || "Sin datos"}`}</div>
      <div>{`Fecha: ${getFormatedDate(stockFlows?.createdAt, DATE_FORMATS.DATE_WITH_TIME)}`}</div>
    </>
  );
};

export const STOCK_TAB_INDEX = 2;

export const STOCK_MODAL_MODES = {
  ADD: "add",
  OUT: "out",
  DELETE: "delete",
};
