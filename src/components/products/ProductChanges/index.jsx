import { Divider, FlexColumn, OverflowWrapper } from "@/common/components/custom";
import { COLORS, DATE_FORMATS, INACTIVE, SPANISH_ACTIVE, SPANISH_INACTIVE, SPANISH_UNKNOWN } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { ATTRIBUTES, getDiffValue, getLabel } from "@/components/products/products.constants";
import { MessageItem } from "../../budgets/ModalUpdates/styles";
import { PRODUCT_STATES } from "../products.constants";
import { List, ListItem, Span } from "./styles";

const ProductChanges = ({ product }) => {
  const createdAt = product?.createdAt;
  const createdBy = product?.createdBy;
  const previousVersions = product?.previousVersions || [];

  if (!previousVersions.length) return null;

  const fullHistory = [...previousVersions, { ...product }];

  const reconstructedVersions = fullHistory
    .slice()
    .reverse()
    .reduce((acc, curr, index) => {
      const nextVersion = acc[index - 1] || {};
      const complete = { ...nextVersion, ...curr };
      return [...acc, complete];
    }, [])
    .reverse();

  const historyToRender = reconstructedVersions
    .map((v, i, arr) => ({ version: v, prevVersion: arr[i - 1] }))
    .slice(1)
    .reverse();

    return (
    <List>
      <ListItem>
        <strong>Producto creado el {getFormatedDate(createdAt, DATE_FORMATS.DATE_WITH_TIME)} {createdBy && `por ${createdBy}`}</strong>
      </ListItem>
      <Divider />
      {historyToRender.map(({ version, prevVersion }, index) => {
        const changes = [];
        const date = version.updatedAt
          ? getFormatedDate(version.updatedAt, DATE_FORMATS.DATE_WITH_TIME)
          : `Versión ${index + 1}`;

        [ATTRIBUTES.NAME, ATTRIBUTES.COMMENTS, ATTRIBUTES.STATE, ATTRIBUTES.EDITABLE_PRICE, ATTRIBUTES.PRICE, ATTRIBUTES.COST].forEach((key) => {
          if (prevVersion[key] !== version[key]) {
            const label = getLabel(key);
            const isPrice = key === ATTRIBUTES.PRICE || key === ATTRIBUTES.COST;
            const isEditable = key === ATTRIBUTES.EDITABLE_PRICE;
            const shouldUseOverflow = key === ATTRIBUTES.NAME || key === ATTRIBUTES.COMMENTS;

            const prevValue =
              key === ATTRIBUTES.STATE
                ? PRODUCT_STATES[prevVersion[key]]?.singularTitle || SPANISH_UNKNOWN
                : isPrice
                  ? getFormatedPrice(prevVersion[key])
                  : isEditable
                    ? prevVersion[key] ? SPANISH_ACTIVE : SPANISH_INACTIVE
                    : getDiffValue(prevVersion[key], key);

            const newValue =
              key === ATTRIBUTES.STATE
                ? PRODUCT_STATES[version[key]]?.singularTitle || SPANISH_UNKNOWN
                : isPrice
                  ? getFormatedPrice(version[key])
                  : isEditable
                    ? version[key] ? SPANISH_ACTIVE : SPANISH_INACTIVE
                    : getDiffValue(version[key], key);

            const prevColor = COLORS.GREY;

            const newColor =
              key === ATTRIBUTES.STATE
                ? PRODUCT_STATES[version[key]]?.color || "inherit"
                : "inherit";

            const renderValue = (value, color) =>
              shouldUseOverflow ? (
                <OverflowWrapper popupContent={value} maxWidth="45%">
                  <Span color={color}>{value}</Span>
                </OverflowWrapper>
              ) : (
                <Span color={color}>{value}</Span>
              );

            changes.push(
              <Span key={`${key}-${index}`}>
                {label}: {renderValue(prevValue, prevColor)} → {renderValue(newValue, newColor)}
              </Span>
            );
          }
        });

        if (version.state === INACTIVE.toUpperCase() && version.inactiveReason) {
          changes.push(
            <Span key={`inactiveReason-${index}`} color={COLORS.RED}>
              Motivo de inactivación: {version.inactiveReason}
            </Span>
          );
        }

        if (
          JSON.stringify(prevVersion.fractionConfig) !==
          JSON.stringify(version.fractionConfig)
        ) {
          const prevMeasure = prevVersion.fractionConfig?.active
            ? prevVersion.fractionConfig.unit
            : "Sin medida";
          const newMeasure = version.fractionConfig?.active
            ? version.fractionConfig.unit
            : "Sin medida";
          changes.push(
            <Span key={`${ATTRIBUTES.FRACTION_CONFIG}}-${index}`}>
              {getLabel(ATTRIBUTES.FRACTION_CONFIG)}:{" "}
              <Span color={COLORS.GREY}>{prevMeasure}</Span> → {newMeasure}
            </Span>
          );
        }

        if (
          JSON.stringify(prevVersion.tags) !== JSON.stringify(version.tags)
        ) {
          const prevTags =
            (prevVersion.tags || []).map((t) => t.name).join(", ") || "Sin etiquetas";
          const newTags = (version.tags || []).map((t) => t.name).join(", ") || "Sin etiquetas";

          changes.push(
            <Span key={`tags-${index}`}>
              {getLabel("tags")}: <Span color={COLORS.GREY}>{prevTags}</Span> → {newTags}
            </Span>
          );
        }

        if (!changes.length) return null;

        const updatedBy = version.updatedBy

        return (
          <FlexColumn key={index}>
            <MessageItem>
              <strong>🕒 {date} {updatedBy && `por ${updatedBy}`}</strong>
              <FlexColumn $margin="5px 0 0 1.5rem!important" $rowGap="5px">
                {changes}
              </FlexColumn>
            </MessageItem>
            <Divider />
          </FlexColumn>
        );
      })}
    </List>
  );
};

export default ProductChanges;
