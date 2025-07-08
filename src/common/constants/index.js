import { encodeUri } from "@/common/utils";

export * from './dates';
export * from './entities';
export * from './time';
export * from './semantic';

export const DEFAULT_SELECTED_CLIENT = "maderera-las-tapias";

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
  USERS: {
    BASE: "/usuarios",
    CREATE: "/usuarios/crear",
    SHOW: (id) => `/usuarios/${id}`,
    NAME: 'Usuarios',
    SHORTKEYS: 'Control+6'
  },
  LOGIN: {
    BASE: "/login"
  },
  SETTINGS: {
    BASE: "/configuracion",
    NAME: 'Configuración',
    SHORTKEYS: 'Control+7'
  },
  CHANGE_PASSWORD: {
    BASE: "/cambiar-contrasena"
  },
  RESTORE_PASSWORD: {
    BASE: "/recuperar-contrasena"
  },
  NOT_FOUND: {
    BASE: "/ups"
  },
};

export const PAGE_SIZE_OPTIONS = [
  { key: 10, text: '10', value: 10 },
  { key: 20, text: '20', value: 20 },
  { key: 50, text: '50', value: 50 },
  { key: 100, text: '100', value: 100 }
];

export const DEFAULT_PAGE_SIZE = 20;

export const EXTERNAL_APIS = {
  MAIL: (email, name) => `mailto:${email}?Subject=${encodeUri(`Hola estimado/a ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
  WSP: (phone, name) => `https://api.whatsapp.com/send?phone=${phone}&text=${encodeUri(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
};

export const REGEX = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,10}))$/,
  TWO_DIGIT_CODE: /^[A-Z0-9]{2}$/,
  MAX26_DIGIT_CODE: /^[A-Za-z0-9\-\_]{1,26}$/,
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
};

export const SHORTKEYS = {
  ENTER: "Control+Enter",
  ALT_ENTER: "Control+Alt+Enter",
  BACKSPACE: "Control+Backspace",
  RIGHT_ARROW: "Control+ArrowRight",
  LEFT_ARROW: "Control+ArrowLeft",
  DELETE: "Control+Delete",
};

export const DEFAULT_KEY = "id";
export const LAST_UPDATED_AT = "lastUpdatedAt";
export const ALL = "all";
export const ACTIVE = "active";
export const DELETE = "delete";
export const INACTIVE = "inactive";
export const RECOVER = "recover";

export const LABELS = {
  ACTIVE: "Activado",
  INACTIVE: "Desactivado",
  UNKNOWN: "Desconocido",
};

export const PASSWORD_REQUIREMENTS = [
  { label: "Al menos 8 caracteres.", test: /.{8,}/ },
  { label: "Una letra mayúscula.", test: /[A-Z]/ },
  { label: "Una letra minúscula.", test: /[a-z]/ },
  { label: "Un número.", test: /\d/ },
  { label: "Un carácter especial.", test: /[@$!%*?&]/ },
];

export const SELECT_ALL_OPTION = { key: ALL, value: ALL, text: 'Todos' };
