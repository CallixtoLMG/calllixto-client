export const ROLES = {
  CALLIXTO: 'callixto',
  SADMIN: 'sadmin',
  ADMIN: 'admin',
  MELI: 'meli',
  USER: 'user',
}

const CALLIXTO = {
  [ROLES.CALLIXTO]: true,
}

const SADMIN = {
  [ROLES.SADMIN]: true,
  ...CALLIXTO
}

const ADMIN = {
  [ROLES.ADMIN]: true,
  ...SADMIN
}

const PRODUCT_ADMIN = {
  [ROLES.MELI]: true,
  ...ADMIN
}

export const RULES = {
  canUpdate: {
    ...ADMIN
  },
  canRemove: {
    ...ADMIN
  },
  canCreate: {
    ...ADMIN
  },
  canUpdateProduct: {
    ...PRODUCT_ADMIN
  },
  canRemoveProduct: {
    ...PRODUCT_ADMIN
  },
  canCreateProduct: {
    ...PRODUCT_ADMIN
  },
  canManageUsers: {
    ...SADMIN
  },
  canUpdateUserRole: {
    ...SADMIN
  },
  canAccessPandora: {
    ...SADMIN,
  },
}

export function isCallixtoUser(role) {
  return role === ROLES.CALLIXTO;
}
