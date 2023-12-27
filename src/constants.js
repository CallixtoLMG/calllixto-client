const PAGES = {
  BASE: "/",
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (code) => `/clientes/${code}/editar`,
    SHOW: (id) => `/clientes/${id}`,
    NAME: 'Clientes'
  },
  SUPPLIERS: {
    BASE: "/proveedores",
    CREATE: "/proveedores/crear",
    UPDATE: (id) => `/proveedores/${id}/editar`,
    SHOW: (id) => `/proveedores/${id}`,
    NAME: 'Proveedores'
  },
  BRANDS: {
    BASE: "/marcas",
    CREATE: "/marcas/crear",
    UPDATE: (id) => `/marcas/${id}/editar`,
    SHOW: (id) => `/marcas/${id}`,
    NAME: 'Marcas'
  },
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    UPDATE: (code) => `/productos/${code}/editar`,
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
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,10}))$/
}

export {
  APIS, PAGES, REGEX
};

