const integerFormatter = new Intl.NumberFormat("es-AR", { useGrouping: "always" });

export const formatInteger = (value) => {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return "";

  const number = Number(value);
  if (!Number.isFinite(number)) return "";

  return Number.isInteger(number) ? integerFormatter.format(number) : String(value);
};
