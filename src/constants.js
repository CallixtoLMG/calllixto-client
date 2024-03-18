const PAGES = {
  BASE: "/",
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (code) => `/clientes/${code}?update=true`,
    SHOW: (id) => `/clientes/${id}`,
    NAME: 'Clientes'
  },
  SUPPLIERS: {
    BASE: "/proveedores",
    CREATE: "/proveedores/crear",
    UPDATE: (id) => `/proveedores/${id}?update=true`,
    SHOW: (id) => `/proveedores/${id}`,
    NAME: 'Proveedores'
  },
  BRANDS: {
    BASE: "/marcas",
    CREATE: "/marcas/crear",
    UPDATE: (id) => `/marcas/${id}?update=true`,
    SHOW: (id) => `/marcas/${id}`,
    NAME: 'Marcas'
  },
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    UPDATE: (code) => `/productos/${code}?update=true`,
    SHOW: (code) => `/productos/${code}`,
    NAME: 'Productos'
  },
  BUDGETS: {
    BASE: "/presupuestos",
    CREATE: "/presupuestos/crear",
    CLONE: (id) => `/presupuestos/crear?clonar=${id}`,
    SHOW: (id) => `/presupuestos/${id}`,
    NAME: 'Presupuestos'
  },
  LOGIN: {
    BASE: "/login"
  },
  NOT_FOUND: {
    BASE: "/ups"
  },
};

const APIS = {
  MAIL: (email, name) => `mailto:${email}?Subject=${encodeURIComponent(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
  WSP: (phone, name) => `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
};

const REGEX = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,10}))$/,
  TWO_DIGIT_CODE: /^[A-Z0-9]{2}$/,
  THREE_DIGIT_CODE: /^[A-Z0-9]{3}$/,
  MAX26_DIGIT_CODE: /^[A-Za-z0-9\-\_]{1,26}$/,
  THREE_NUMBERS_CODE: /^[0-9]{1,3}$/,
};

const RULES = {
  REQUIRED: {
    required: 'Campo requerido'
  },
  REQUIRED_PRODUCT: (value) => ({
    required: value !== false ? 'Campo requerido' : 'Es necesario elegir un producto',
  }),
  REQUIRED_TWO_DIGIT: {
    required: 'Campo requerido',
    pattern: { value: REGEX.TWO_DIGIT_CODE, message: 'El código debe ser de 2 cifras alfanumérico' }
  },
  REQUIRED_MAX26_DIGIT_CODE: {
    required: 'Campo requerido',
    pattern: { value: REGEX.MAX26_DIGIT_CODE, message: 'El código debe tener entre 5 y 30 valores alfanuméricos(- y _ habilitados), sumando marca y proveedor' }
  },
  REQUIRED_THREE_NUMBERS: {
    required: 'Campo requerido',
    pattern: { value: REGEX.THREE_NUMBERS_CODE, message: 'El valor puede ser hasta un máximo de 3 números' }
  },
  PHONE: {
    AREA_CODE: {
      minLength: { value: 3, message: 'El código de área debe tener 3 o 4 cifras' },
      maxLength: { value: 4, message: 'El código de área debe tener 3 o 4 cifras' },
    },
    AREA_CODE_REQUIRED: {
      required: 'Campo requerido',
      minLength: { value: 3, message: 'El código de área debe tener 3 o 4 cifras' },
      maxLength: { value: 4, message: 'El código de área debe tener 3 o 4 cifras' },
    },
    NUMBER: {
      minLength: { value: 6, message: 'El número completo debe tener 10 cifras' },
      maxLength: { value: 7, message: 'El número completo debe tener 10 cifras' },
    },
    NUMBER_REQUIRED: {
      required: 'Campo requerido',
      minLength: { value: 6, message: 'El número completo debe tener 10 cifras' },
      maxLength: { value: 7, message: 'El número completo debe tener 10 cifras' },
    }
  },
  EMAIL: {
    pattern: { value: REGEX.EMAIL, message: 'El email no es válido' }
  },
  REQUIRED_PRICE: {
    required: 'Campo requerido',
    min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
  },
  REQUIRED_POSITIVE: {
    required: 'Campo requerido',
    min: { value: 1, message: 'El campo debe ser mayor a 0' }
  }
}

const TIME_IN_MS = {
  THREE_SECONDS: 3000,
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 300000,
  ONE_HOUR: 3600000,
}

const LOCALE = 'es-AR';
const CURRENCY = 'ARS';

export {
  APIS, CURRENCY, LOCALE, PAGES, REGEX, RULES, TIME_IN_MS
};

