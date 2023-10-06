export const totalSum = (value) => {
  return (
    value.reduce((accumulator, product) => {
      return accumulator + Number(product.total || 0);
    }, 0).toFixed(2)
  );
};

export const modDate = (date) => {
  return date.split("T")[0]
};

export const modPrice = (number) => {
  return `$ ${Number(number.toLocaleString("de-DE"))}`
};