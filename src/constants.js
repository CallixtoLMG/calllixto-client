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
  THREE_DIGIT_CODE: /^[A-Z0-9]{3}$/
}

const RULES = {
  REQUIRED: {
    required: 'Campo requerido'
  },
  REQUIRED_TWO_DIGIT: {
    required: 'Campo requerido',
    pattern: { value: REGEX.TWO_DIGIT_CODE, message: 'El código debe ser de 2 cifras alfanumérico' }
  },
  REQUIRED_THREE_DIGIT: {
    required: 'Campo requerido',
    pattern: { value: REGEX.THREE_DIGIT_CODE, message: 'El código debe ser de 3 cifras alfanumérico' }
  },
  PHONE: {
    AREA_CODE: {
      minLength: { value: 3, message: 'El código de área debe tener 3 o 4 cifras' },
      maxLength: { value: 4, message: 'El código de área debe tener 3 o 4 cifras' },
    },
    NUMBER: {
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
  }
}

export {
  APIS, PAGES, REGEX, RULES
};
