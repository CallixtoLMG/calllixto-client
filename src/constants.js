const PAGES = {
  BASE: "/",
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
    SHOWPDF: (id) => `/presupuestos/${id}/pdf`
  },
  LOGIN: {
    BASE: "/login"
  },
  NOTFOUND: {
    BASE: "/ups"
  },
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (code) => `/clientes/${code}/editar`,
    SHOW: (id) => `/clientes/${id}`
  }
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

