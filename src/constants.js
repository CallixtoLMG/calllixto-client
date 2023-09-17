const PAGES = {
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    SHOW: (id) => `/productos/${id}`
  },
  BUDGETS: {
    BASE: "/presupuestos",
    CREATE: "/presupuestos/crear",
    SHOW: (id) => `/presupuestos/${id}`
  }
}

export {
  PAGES
}