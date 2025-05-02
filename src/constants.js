import { encodeUri } from "@/utils";

export const PAGES = {
  BASE: "/",
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (code) => `/clientes/${code}?update=true`,
    SHOW: (id) => `/clientes/${id}`,
    NAME: 'Clientes',
    SHORTKEYS: 'Control+1'
  },
  SUPPLIERS: {
    BASE: "/proveedores",
    CREATE: "/proveedores/crear",
    UPDATE: (id) => `/proveedores/${id}?update=true`,
    SHOW: (id) => `/proveedores/${id}`,
    NAME: 'Proveedores',
    SHORTKEYS: 'Control+2'
  },
  BRANDS: {
    BASE: "/marcas",
    CREATE: "/marcas/crear",
    UPDATE: (id) => `/marcas/${id}?update=true`,
    SHOW: (id) => `/marcas/${id}`,
    NAME: 'Marcas',
    SHORTKEYS: 'Control+3'
  },
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    UPDATE: (code) => `/productos/${code}?update=true`,
    SHOW: (code) => `/productos/${code}`,
    NAME: 'Productos',
    SHORTKEYS: 'Control+4'
  },
  BUDGETS: {
    BASE: "/ventas",
    CREATE: "/ventas/crear",
    CLONE: (id) => `/ventas/crear?clonar=${id}`,
    SHOW: (id) => `/ventas/${id}`,
    NAME: 'Ventas',
    SHORTKEYS: 'Control+5'
  },
  LOGIN: {
    BASE: "/login"
  },
  NOT_FOUND: {
    BASE: "/ups"
  },
};

export const APIS = {
  MAIL: (email, name) => `mailto:${email}?Subject=${encodeUri(`Hola estimado/a ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
  WSP: (phone, name) => `https://api.whatsapp.com/send?phone=${phone}&text=${encodeUri(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
};

export const REGEX = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,10}))$/,
  TWO_DIGIT_CODE: /^[A-Z0-9]{2}$/,
  THREE_DIGIT_CODE: /^[A-Z0-9]{3}$/,
  MAX26_DIGIT_CODE: /^[A-Za-z0-9\-\_]{1,26}$/,
  THREE_NUMBERS_CODE: /^[0-9]{1,3}$/,
};

export const RULES = {
  REQUIRED: {
    required: 'Campo requerido.'
  },
  REQUIRED_PRODUCT: (value) => ({
    required: value !== false ? 'Campo requerido.' : 'Es necesario elegir un producto',
  }),
  REQUIRED_TWO_DIGIT: {
    required: 'Campo requerido.',
    pattern: { value: REGEX.TWO_DIGIT_CODE, message: 'El código debe ser de 2 cifras alfanumérico' }
  },
  REQUIRED_BRAND_AND_SUPPLIER: (brand, supplier) => ({
    validate: (value) => {
      if (!brand?.id || !supplier?.id) {
        return 'Debe seleccionar un proveedor y una marca antes de ingresar un código';
      }
      if (!value) {
        return 'El código es requerido';
      }
      if (!REGEX.MAX26_DIGIT_CODE.test(value)) {
        return 'El código no puede tener más de 26 caracteres alfanuméricos, incluyendo "-" y "_"';
      }
      return true;
    }
  }),
  REQUIRED_THREE_NUMBERS: {
    required: 'Campo requerido.',
    pattern: { value: REGEX.THREE_NUMBERS_CODE, message: 'El valor puede ser hasta un máximo de 3 números' }
  },
  PHONE: {
    AREA_CODE: {
      minLength: { value: 3, message: 'El código de área debe tener 3 o 4 cifras' },
      maxLength: { value: 4, message: 'El código de área debe tener 3 o 4 cifras' },
    },
    AREA_CODE_REQUIRED: {
      required: 'Campo requerido.',
      minLength: { value: 3, message: 'El código de área debe tener 3 o 4 cifras' },
      maxLength: { value: 4, message: 'El código de área debe tener 3 o 4 cifras' },
    },
    NUMBER: {
      minLength: { value: 6, message: 'El número completo debe tener 10 cifras' },
      maxLength: { value: 7, message: 'El número completo debe tener 10 cifras' },
    },
    NUMBER_REQUIRED: {
      required: 'Campo requerido.',
      minLength: { value: 6, message: 'El número completo debe tener 10 cifras' },
      maxLength: { value: 7, message: 'El número completo debe tener 10 cifras' },
    }
  },
  EMAIL: {
    pattern: { value: REGEX.EMAIL, message: 'El email no es válido' }
  },
  REQUIRED_PRICE: {
    required: 'Campo requerido.',
    min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
  },
  REQUIRED_POSITIVE: {
    required: 'Campo requerido.',
    min: { value: 1, message: 'El campo debe ser mayor a 0' }
  }
};

export const TIME_IN_MS = {
  THREE_SECONDS: 3000,
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 300000,
  ONE_HOUR: 3600000,
  FOUR_HOURS: 14400000,
  ONE_DAY: 86400000,
};

export const TIME_IN_DAYS = {
  YEAR: '365',
};

export const DEFAULT_PAGE_SIZE = 20;

export const getDefaultListParams = (attributes, sort, order) => {
  const params = {
    attributes: encodeUri(Object.values(attributes)),
  };

  if (sort) params.sort = sort;
  if (typeof order !== 'undefined') params.order = order;

  return params;
};

export const ENTITIES = {
  CUSTOMERS: 'customers',
  CUSTOMER: 'customer',
  SUPPLIERS: 'suppliers',
  SUPPLIER: 'supplier',
  BRANDS: 'brands',
  BRAND: 'brand',
  PRODUCTS: 'products',
  PRODUCT: 'product',
  BUDGETS: 'budgets',
  BUDGET: 'budget',
  EVENTS: 'events'
};

export const DEFAULT_SELECTED_CLIENT = "callixto";

export const BUDGET_STATES = {
  CONFIRMED: {
    id: 'CONFIRMED',
    title: 'Confirmados',
    singularTitle: 'Confirmado',
    color: 'green',
    icon: 'check',
  },
  PENDING: {
    id: 'PENDING',
    title: 'Pendientes',
    singularTitle: 'Pendiente',
    color: 'orange',
    icon: 'hourglass half',
  },
  DRAFT: {
    id: 'DRAFT',
    title: 'Borradores',
    singularTitle: 'Borrador',
    color: 'teal',
    icon: 'erase',
  },
  CANCELLED: {
    id: 'CANCELLED',
    title: 'Anulados',
    singularTitle: 'Anulado',
    color: 'red',
    icon: 'ban',
  },
  EXPIRED: {
    id: 'EXPIRED',
    title: 'Expirados',
    singularTitle: 'Expirado',
    color: 'brown',
    icon: 'expired',
  },
};

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

export const CUSTOMER_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const SUPPLIER_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const BRANDS_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const SHORTKEYS = {
  ENTER: "Control+Enter",
  ALT_ENTER: "Control+Alt+Enter",
  BACKSPACE: "Control+Backspace",
  RIGHT_ARROW: "Control+ArrowRight",
  LEFT_ARROW: "Control+ArrowLeft",
  DELETE: "Control+Delete",
};

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

export const PRODUCTS_HELP = {
  FRACTIONABLE_PRODUCT: "Al activar esta opción los precios pueden ser editables desde la creación de un presupuesto.",
  EDITABLE_PRICE: "Al activar esta opción se pueden fraccionar los productos desde la creación de un presupuesto.",
};

export const COLORS = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  ORANGE: 'orange',
  GREY: 'grey',
  SOFT_GREY: 'softgrey',
  BROWN: 'brown',
  TEAL: 'teal',
  YELLOW: "yellow"
};

export const ICONS = {
  X: 'x',
  TRASH: 'trash',
  CHECK: 'check',
  TRUCK: 'truck',
  HOURGLASS_HALF: "hourglass half",
  ADD: "add",
  UNDO: "undo",
  BAN: "ban",
  FILE_EXCEL: "file excel",
  FILE_EXCEL_OUTLINE: "file excel outline",
  SEND: "send",
  DOWNLOAD: "download",
  COPY: "copy",
  DOLLAR: "dollar",
  PLAY_CIRCLE: "play circle",
  PAUSE_CIRCLE: "pause circle",
  BOX: "box",
  QUESTION: "question",
  BARCODE: "barcode",
  LIST_UL: "list ul",
  INFO_CIRCLE: "info circle",
  WAREHOUSE: "warehouse",
  ARROW_LEFT: "arrow left",
  CANCEL: "cancel",
  DELETE: "delete",
  EDIT: "edit",
  TIMES: "times",
  KEYBOARD: "keyboard",
  REMOVE: "remove",
  SEARCH: "search",
  CHEVRON_RIGHT: "chevron right",
  USER: "user",
  LOCK: "lock",
  PENCIL: "pencil",
  CUT: "cut",
  EDIT: "edit",
  EYE: "eye",
  COG: "cog",
  EXCLAMATION_CIRCLE: "exclamation circle",
  ADDRESS_CARD: "address card",
  ARCHIVE: "archive",
  OPTIONS: "options",
  REFRESH: "refresh"
};

export const PAGE_SIZE_OPTIONS = [
  { key: 10, text: '10', value: 10 },
  { key: 20, text: '20', value: 20 },
  { key: 50, text: '50', value: 50 },
  { key: 100, text: '100', value: 100 }
];

export const PICK_UP_IN_STORE = "Retira en tienda";

export const OOS = "Sin stock";

export const ALL = "all";

export const ACTIVE = "active";

export const INACTIVE = "inactive";

export const EVENT_KEYS = {
  UPDATE: 'U',
  CREATE: "C",
  DELETE: "D",
  UPDATE_ALL: "A",
  DELETE_SUPPLIER_PRODUCTS: "S"
}

export const DEFAULT_LAST_EVENT_ID = "A0000";

export const ID = "id";

export const CODE = "code";

export const FILTERS_OPTIONS = {
  DATE: "date",
  NAME: "name"
};

export const BUDGET_PDF_FORMAT = {
  DISPATCH: {
    icon: ICONS.TRUCK,
    key: "dispatch",
    title: "Remito"
  },
  CLIENT: {
    key: 'client',
    icon: ICONS.ADDRESS_CARD,
    title: 'Cliente',
  },
  INTERNAL: {
    key: "internal",
    icon: ICONS.ARCHIVE,
    title: 'Interno'
  },
};

