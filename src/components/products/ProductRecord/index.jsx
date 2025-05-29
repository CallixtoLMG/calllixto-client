import { Divider } from "@/common/components/custom";
import { COLORS } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { MessageItem } from "../../budgets/ModalUpdates/styles";

const FIELD_LABELS = {
  name: "Nombre",
  comments: "Comentario",
  state: "Estado",
  fractionConfig: "Medida",
  tags: "Etiquetas",
  editablePrice: "Precio editable",
  price: "Precio",
  cost: "Costo",
};

const getStateLabel = (state) => {
  switch (state) {
    case "ACTIVE":
      return "Activo";
    case "INACTIVE":
      return "Inactivo";
    case "OOS":
      return "Sin stock";
    case "DELETED":
      return "Eliminado";
    default:
      return "Desconocido";
  }
};

const getLabel = (key) => FIELD_LABELS[key] || key;

const getDiffValue = (value, key) => {
  if (value === null || value === undefined || value === "") {
    if (key === "comments") return "Sin comentario";
    if (key === "name") return "Sin nombre";
    if (key === "tags") return "Sin etiquetas";
    if (key === "fractionConfig") return "Sin medida";
    return "—";
  }
  return value;
};

const ProductChangeHistory = ({ product }) => {
  const createdAt = product?.createdAt;
  const history = [...(product?.previousVersions || [])];

  if (!history.length) return null;

  const baseProduct = { ...product };
  delete baseProduct.previousVersions;

  const fullHistory = history.reduce((acc, version) => {
    const lastVersion = acc.length > 0 ? acc[acc.length - 1] : baseProduct;
    const nextVersion = { ...lastVersion, ...version };
    acc.push(nextVersion);
    return acc;
  }, []);

  return (
    <ul>
      <li>
        <strong>Producto creado el {getFormatedDate(createdAt)}</strong>
      </li>
      <Divider />
      {fullHistory
        .slice()
        .reverse()
        .map((version, reversedIndex) => {
          const index = fullHistory.length - 1 - reversedIndex;
          const prevVersion = index > 0 ? fullHistory[index - 1] : null;
          if (!prevVersion) return null;

          const changes = [];
          const date = version.updatedAt
            ? getFormatedDate(version.updatedAt)
            : `Versión ${index + 1}`;

          ["name", "comments", "state", "editablePrice", "price", "cost"].forEach((key) => {
            if (prevVersion[key] !== version[key]) {
              const label = getLabel(key);
              const isPrice = key === "price" || key === "cost";

              const prevValue =
                key === "state"
                  ? getStateLabel(prevVersion[key])
                  : isPrice
                    ? getFormatedPrice(prevVersion[key])
                    : getDiffValue(prevVersion[key], key);

              const newValue =
                key === "state"
                  ? getStateLabel(version[key])
                  : isPrice
                    ? getFormatedPrice(version[key])
                    : getDiffValue(version[key], key);

              changes.push(
                <span key={`${key}-${index}`}>
                  {label}: <span style={{ color: COLORS.GREY }}>{prevValue}</span> → {newValue}
                </span>
              );
            }
          });

          if (
            version.state === "INACTIVE" &&
            version.inactiveReason &&
            version.inactiveReason !== prevVersion.inactiveReason
          ) {
            changes.push(
              <span key={`inactiveReason-${index}`} style={{ color: COLORS.RED }}>
                Motivo de inactivación: {version.inactiveReason}
              </span>
            );
          }

          if (
            version.fractionConfig &&
            JSON.stringify(version.fractionConfig) !==
              JSON.stringify(prevVersion.fractionConfig)
          ) {
            const prevMeasure = prevVersion.fractionConfig?.active
              ? prevVersion.fractionConfig.unit
              : "Sin medida";
            const newMeasure = version.fractionConfig?.active
              ? version.fractionConfig.unit
              : "Sin medida";
            changes.push(
              <span key={`fractionConfig-${index}`}>
                {getLabel("fractionConfig")}:{" "}
                <span style={{ color: COLORS.GREY }}>{prevMeasure}</span> → {newMeasure}
              </span>
            );
          }

          if (
            version.tags &&
            JSON.stringify(version.tags) !== JSON.stringify(prevVersion.tags)
          ) {
            const prevTags =
              (prevVersion.tags || []).map((t) => t.name).join(", ") || "Sin etiquetas";
            const newTags = version.tags.map((t) => t.name).join(", ") || "Sin etiquetas";

            changes.push(
              <span key={`tags-${index}`}>
                {getLabel("tags")}: <span style={{ color: COLORS.GREY }}>{prevTags}</span> → {newTags}
              </span>
            );
          }

          if (!changes.length) return null;

          return (
            <div key={index}>
              <MessageItem>
                <strong>🕒 {date}</strong>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    marginTop: "5px",
                  }}
                >
                  {changes}
                </div>
              </MessageItem>
              <Divider />
            </div>
          );
        })}
    </ul>
  );
};

export default ProductChangeHistory;
