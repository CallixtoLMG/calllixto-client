export const totalSum = (value) => {
  return (
    value?.reduce((accumulator, product) => {
      return accumulator + Number(product.total || 0);
    }, 0).toFixed(2)
  );
};

export const IVA = (value) => {
  value = Number(value)
  const iva = value * 0.21;
  return iva.toFixed(2);
};

export const totalIVA = (value) => {
  value = Number(value)
  const iva = value * 0.21;
  const totalConIVA = value + iva;
  return totalConIVA.toFixed(2);
};

export const modDate = (date) => date?.split("T")[0];

export const modPrice = (number) => {
  let modNumber = Number(number);
  return modNumber.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
};

export const getVisibilityRules = (rol) => {
  switch (rol) {
    case 'user':
    default:
      return {
        canCreateProduct: false,
        canUseActions: false,
      };
    case 'admin':
      return {
        canSeeButtons: true,
        canUseActions: true,
      };
    case 'superadmin':
      return {
        canSeeButtons: true,
        canUseActions: true,
      };
    case 'callixto':
      return {
        canSeeButtons: true,
        canUseActions: true,
      };
  };
};
