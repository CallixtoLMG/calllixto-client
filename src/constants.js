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
    BASE: "/presupuestos",
    CREATE: "/presupuestos/crear",
    CLONE: (id) => `/presupuestos/crear?clonar=${id}`,
    SHOW: (id) => `/presupuestos/${id}`,
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
  MAIL: (email, name) => `mailto:${email}?Subject=${encodeUri(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
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
  REQUIRED_MAX26_DIGIT_CODE: {
    required: 'Campo requerido.',
    pattern: { value: REGEX.MAX26_DIGIT_CODE, message: 'El código debe tener entre 5 y 30 valores alfanuméricos(- y _ habilitados), sumando marca y proveedor' }
  },
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
};

export const TIME_IN_DAYS = {
  YEAR: '365',
};

export const DEFAULT_PAGE_SIZE = 30;

export const ENTITIES = {
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  BRANDS: 'brands',
  PRODUCTS: 'products',
  BUDGETS: 'budgets',
};

export const DEFAULT_SELECTED_CLIENT = "maderera-las-tapias";

export const BUDGET_PDF_FORMAT = {
  DISPATCH: "dispatch",
  CLIENT: "client",
  INTERNAL: "internal",
};

export const BUDGET_STATES = {
  CONFIRMED: {
    id: 'CONFIRMED',
    title: 'Confirmado',
    color: 'green',
    icon: 'check',
  },
  PENDING: {
    id: 'PENDING',
    title: 'Pendiente',
    color: 'orange',
    icon: 'hourglass half',
  },
  DRAFT: {
    id: 'DRAFT',
    title: 'Borrador',
    color: 'teal',
    icon: 'erase',
  },
  EXPIRED: {
    id: 'EXPIRED',
    title: 'Expirado',
    color: 'red',
    icon: 'expired',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivo',
    color: 'grey',
    icon: 'ban',
  },
};

export const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  DATE: 'date',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
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
  FRACTIONABLE_PRODUCT: "Precio editable: ...",
  EDITABLE_PRICE: "Producto fraccioanble: ...",
};
