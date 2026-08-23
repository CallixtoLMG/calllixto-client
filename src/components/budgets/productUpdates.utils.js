const getBooleanFlagChange = (originalValue, currentValue) => {
  const oldValue = Boolean(originalValue);
  const newValue = Boolean(currentValue);

  return {
    changed: oldValue !== newValue,
    oldValue,
    newValue,
  };
};

const getStrictValueChange = (oldValue, newValue) => ({
  changed: oldValue !== newValue,
  oldValue,
  newValue,
});

export const getBudgetProductChanges = (originalProduct = {}, currentProduct = {}) => {
  const changes = {
    price: getStrictValueChange(originalProduct.price, currentProduct.price),
    state: getStrictValueChange(originalProduct.state, currentProduct.state),
    editablePrice: getBooleanFlagChange(
      originalProduct.editablePrice,
      currentProduct.editablePrice
    ),
    fractionConfigActive: getBooleanFlagChange(
      originalProduct.fractionConfig?.active,
      currentProduct.fractionConfig?.active
    ),
  };

  return {
    ...changes,
    hasChanges: Object.values(changes).some(change => change.changed),
  };
};
