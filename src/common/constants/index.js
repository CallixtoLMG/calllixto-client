import { encodeUri } from "@/common/utils";

export * from './dates';
export * from './entities';
export * from './semantic';
export * from './time';

export const DEFAULT_SELECTED_CLIENT = "maderera-las-tapias";

export const PAGES = {
  BASE: "/",
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (id) => `/clientes/${id}?update=true`,
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
    UPDATE: (id) => `/productos/${id}?update=true`,
    SHOW: (id) => `/productos/${id}`,
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
  EXPENSES: {
    BASE: "/gastos",
    CREATE: "/gastos/crear",
    CLONE: (id) => `/gastos/crear?clonar=${id}`,
    UPDATE: (id) => `/gastos/${id}?update=true`,
    SHOW: (id) => `/gastos/${id}`,
    NAME: 'Gastos',
    SHORTKEYS: 'Control+6'
  },
  USERS: {
    BASE: "/usuarios",
    CREATE: "/usuarios/crear",
    SHOW: (id) => `/usuarios/${id}`,
    NAME: 'Usuarios',
    SHORTKEYS: 'Control+7'
  },
  CASH_BALANCES: {
    BASE: "/cajas",
    CREATE: "/cajas/crear",
    UPDATE: (id) => `/cajas/${id}?update=true`,
    SHOW: (id) => `/cajas/${id}`,
    NAME: 'Cajas',
    SHORTKEYS: 'Control+8'
  },
  LOGIN: {
    BASE: "/login"
  },
  SETTINGS: {
    BASE: "/configuracion",
    NAME: 'Configuración',
    SHORTKEYS: 'Control+9'
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
  TWO_DIGIT_ID: /^[A-Z0-9]{2}$/,
  MAX26_DIGIT_ID: /^[A-Za-z0-9\-\_]{1,26}$/,
};

export const RULES = {
  REQUIRED: {
    required: 'Campo requerido.'
  },
  REQUIRED_PRODUCT: (value) => ({
    required: value !== false ? 'Campo requerido.' : 'Es necesario elegir un producto',
  }),
  REQUIRED_POSITIVE_NUMBER: {
    required: "El monto es obligatorio",
    validate: (value) => {
      if (value === null || value === undefined || value === '') return "Debe ingresar un monto";
      if (isNaN(value)) return "El valor debe ser un número";
      if (Number(value) < 0) return "Debe ser un valor mayor o igual a cero";
      return true;
    }
  },
  REQUIRED_TWO_DIGIT: {
    required: 'Campo requerido.',
    pattern: { value: REGEX.TWO_DIGIT_ID, message: 'El id debe ser de 2 cifras alfanumérico' }
  },
  REQUIRED_BRAND_AND_SUPPLIER: (brand, supplier) => ({
    validate: (value) => {
      if (!brand?.id || !supplier?.id) {
        return 'Debe seleccionar un proveedor y una marca antes de ingresar un id';
      }
      if (!value) {
        return 'El id es requerido';
      }
      if (!REGEX.MAX26_DIGIT_ID.test(value)) {
        return 'El id no puede tener más de 26 caracteres alfanuméricos, incluyendo "-" y "_"';
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
export const COLORS = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  ORANGE: 'orange',
  GREY: 'grey',
  BROWN: 'brown',
  TEAL: 'teal',
  YELLOW: "yellow"
};

export const SIZES = {
  MINI: 'mini',
  TINY: 'tiny',
  SMALL: 'small',
  LARGE: 'large',
  HUGE: 'huge',
};

export const SEMANTIC_COLORS = [
  { key: "yellow", text: "Amarillo", value: "yellow" },
  { key: "blue", text: "Azul", value: "blue" },
  { key: "brown", text: "Marrón", value: "brown" },
  { key: "grey", text: "Gris", value: "grey" },
  { key: "black", text: "Negro", value: "black" },
  { key: "olive", text: "Oliva", value: "olive" },
  { key: "orange", text: "Naranja", value: "orange" },
  { key: "pink", text: "Rosa", value: "pink" },
  { key: "purple", text: "Púrpura", value: "purple" },
  { key: "red", text: "Rojo", value: "red" },
  { key: "green", text: "Verde", value: "green" },
  { key: "teal", text: "Turquesa", value: "teal" },
  { key: "violet", text: "Violeta", value: "violet" },
];

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
  EYE_SLASH: "eye slash",
  COG: "cog",
  EXCLAMATION_CIRCLE: "exclamation circle",
  TAGS: "tags",
  ADDRESS_CARD: "address card",
  ARCHIVE: "archive",
  OPTIONS: "options",
  REFRESH: "refresh",
  MAIL_SQUARE: "mail square",
  PERCENT: 'percent',
  SETTINGS: "settings",
  BULLHORN: "bullhorn",
  BOXES: "boxes",
  CLOSE: "close",
  ARROW_UP: "arrow up",
  ARROW_DOWN: "arrow down",
};

export const ALL = "all";
export const ACTIVE = "active";
export const DELETE = "delete";
export const INACTIVE = "inactive";

export const CANCELLED = "cancelled";

export const CANCEL_ACTION = "cancel";

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

export const SORTING = {
  ASC: 'ascending',
  DESC: 'descending'
}


