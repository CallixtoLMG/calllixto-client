export const Rules = (role) => {
  switch (role) {
    case 'user':
    default:
      return {
        canCreateProduct: false,
        canSeeActions: false,
      };
    case 'admin':
      return {
        canSeeButtons: true,
        canSeeActions: true,
      };
    case 'superadmin':
      return {
        canSeeButtons: true,
        canSeeActions: true,
      };
    case 'callixto':
      return {
        canSeeButtons: true,
        canSeeActions: true,
      };
  };
};