export const ROLES = {
  CALLIXTO: 'callixto',
  SADMIN: 'sadmin',
  ADMIN: 'admin',
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
  canManageUsers: {
    ...SADMIN
  },
  canUpdateUserRole: {
    ...SADMIN
  },
}

export function isCallixtoUser(role) {
  return role === ROLES.CALLIXTO;
}
