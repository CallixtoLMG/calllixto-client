export const ROLES = {
  CALLIXTO: 'callixto',
  ADMIN: 'admin',
  USER: 'user',
}

const CALLIXTO = {
  [ROLES.CALLIXTO]: true,
}

const ADMIN = {
  [ROLES.ADMIN]: true,
  ...CALLIXTO
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