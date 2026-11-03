export const PLURAL_LABELS = {
  day: {
    singular: "día",
    plural: "días",
    lastArticle: { singular: "Último", plural: "Últimos" },
  },
  week: {
    singular: "semana",
    plural: "semanas",
    lastArticle: { singular: "Última", plural: "Últimas" },
  },
  month: {
    singular: "mes",
    plural: "meses",
    lastArticle: { singular: "Último", plural: "Últimos" },
  },
  product: {
    singular: "producto",
    plural: "productos",
  },
  customer: {
    singular: "cliente",
    plural: "clientes",
  },
  category: {
    singular: "categoría",
    plural: "categorías",
  },
  unit: {
    singular: "unidad",
    plural: "unidades",
  },
  time: {
    singular: "vez",
    plural: "veces",
  },
};

export const isSingularCount = (count) => Number(count) === 1;

export const pluralize = (count, singular, plural = `${singular}s`) => {
  return isSingularCount(count) ? singular : plural;
};

export const getPluralLabel = (key, count) => {
  const label = PLURAL_LABELS[key];

  if (!label) {
    throw new Error(`No existe una etiqueta pluralizable para "${key}".`);
  }

  return pluralize(count, label.singular, label.plural);
};

export const formatCount = (count, keyOrSingular, plural) => {
  const label = PLURAL_LABELS[keyOrSingular]
    ? getPluralLabel(keyOrSingular, count)
    : pluralize(count, keyOrSingular, plural);

  return `${count} ${label}`;
};

export const formatLastCount = (count, key) => {
  const label = PLURAL_LABELS[key];

  if (!label?.lastArticle) {
    throw new Error(`No existe un artículo de rango para "${key}".`);
  }

  const article = pluralize(
    count,
    label.lastArticle.singular,
    label.lastArticle.plural
  );

  return isSingularCount(count)
    ? `${article} ${label.singular}`
    : `${article} ${count} ${label.plural}`;
};
