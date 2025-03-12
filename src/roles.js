export const ROLES = {
  CALLIXTO: 'callixto',
  SUPER_ADMIN: 'sadmin',
  ADMIN: 'admin',
  USER: 'user',
}

const CALLIXTO = {
  [ROLES.CALLIXTO]: true,
}

const SUPER_ADMIN = {
  [ROLES.SUPER_ADMIN]: true,
  ...CALLIXTO
}

const ADMIN = {
  [ROLES.ADMIN]: true,
  ...SUPER_ADMIN
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
}

export function isCallixtoUser(role) {
  return role === ROLES.CALLIXTO;
}