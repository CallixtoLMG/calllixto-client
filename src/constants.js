const PAGES = {
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    UPDATE: (code) => `/productos/${code}/editar`,
    SHOW: (code) => `/productos/${code}`
  },
  BUDGETS: {
    BASE: "/presupuestos",
    CREATE: "/presupuestos/crear",
    SHOW: (id) => `/presupuestos/${id}`,
    SHOWPDF: (id) => `/presupuestos/${id}/verPdf`
  },
  LOGIN: {
    BASE: "/login"
  },
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (code) => `/clientes/${code}/editar`,
    SHOW: (id) => `/clientes/${id}`
  }
};

export {
  PAGES
};

