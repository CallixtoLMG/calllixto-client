import { Divider, FlexColumn, OverflowWrapper } from "@/common/components/custom";
import { COLORS, DATE_FORMATS, LABELS } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { ATTRIBUTES, PRODUCT_LABELS, getLabel } from "@/components/products/products.constants";
import isEqual from "lodash/isEqual";
import { MessageItem } from "../../budgets/ModalUpdates/styles";
import { PRODUCT_STATES } from "../products.constants";
import { List, Span } from "./styles";

const withOverflow = (value, color = "inherit") => (
  <OverflowWrapper $verticalAlign="bottom" popupContent={value} maxWidth="45%">
    <Span color={color}>{value}</Span>
  </OverflowWrapper>
);

const renderName = ({ oldValue, newValue }) => (
  <Span key={ATTRIBUTES.NAME}>
    {getLabel(ATTRIBUTES.NAME)}: {withOverflow(oldValue, COLORS.GREY)} → {withOverflow(newValue)}
  </Span>
);

const renderComments = ({ oldValue, newValue }) => (
  <Span key={ATTRIBUTES.COMMENTS}>
    {getLabel(ATTRIBUTES.COMMENTS)}: {withOverflow(oldValue, COLORS.GREY)} → {withOverflow(newValue)}
  </Span>
);

const renderState = ({ oldValue, newValue }) => {
  const prevLabel = PRODUCT_STATES[oldValue]?.singularTitle || LABELS.UNKNOWN;
  const newLabel = PRODUCT_STATES[newValue]?.singularTitle || LABELS.UNKNOWN;
  const newColor = PRODUCT_STATES[newValue]?.color || "inherit";

  return (
    <Span key={ATTRIBUTES.STATE}>
      {getLabel(ATTRIBUTES.STATE)}: <Span color={COLORS.GREY}>{prevLabel}</Span> → <Span color={newColor}>{newLabel}</Span>
    </Span>
  );
};

const renderEditablePrice = ({ oldValue, newValue }) => (
  <Span key={ATTRIBUTES.EDITABLE_PRICE}>
    {getLabel(ATTRIBUTES.EDITABLE_PRICE)}: <Span color={COLORS.GREY}>{oldValue ? LABELS.ACTIVE : LABELS.INACTIVE}</Span> → {newValue ? LABELS.ACTIVE : LABELS.INACTIVE}
  </Span>
);

const renderPrice = ({ oldValue, newValue }) => (
  <Span key={ATTRIBUTES.PRICE}>
    {getLabel(ATTRIBUTES.PRICE)}: <Span color={COLORS.GREY}>{getFormatedPrice(oldValue)}</Span> → {getFormatedPrice(newValue)}
  </Span>
);

const renderCost = ({ oldValue, newValue }) => (
  <Span key={ATTRIBUTES.COST}>
    {getLabel(ATTRIBUTES.COST)}: <Span color={COLORS.GREY}>{getFormatedPrice(oldValue)}</Span> → {getFormatedPrice(newValue)}
  </Span>
);

const renderFractionConfig = ({ oldValue, newValue }) => {
  const oldMeasure = oldValue?.active ? oldValue.unit : PRODUCT_LABELS.NO_MEASURE;
  const newMeasure = newValue?.active ? newValue.unit : PRODUCT_LABELS.NO_MEASURE;
  return (
    <Span key={ATTRIBUTES.FRACTION_CONFIG}>
      {getLabel(ATTRIBUTES.FRACTION_CONFIG)}: <Span color={COLORS.GREY}>{oldMeasure}</Span> → {newMeasure}
    </Span>
  );
};

const renderTags = ({ oldValue, newValue }) => {
  const prevTags = (oldValue || []).map((t) => t.name).join(", ") || PRODUCT_LABELS.NO_TAGS;
  const newTags = (newValue || []).map((t) => t.name).join(", ") || PRODUCT_LABELS.NO_TAGS;
  return (
    <Span key={ATTRIBUTES.TAGS}>
      {getLabel(ATTRIBUTES.TAGS)}: <Span color={COLORS.GREY}>{prevTags}</Span> → {newTags}
    </Span>
  );
};

const renderInactiveReason = ({ newValue }) => (
  <Span key={ATTRIBUTES.INACTIVE_REASON} color={COLORS.RED}>
    Motivo de inactivación: {newValue}
  </Span>
);

const renderFunctions = {
  [ATTRIBUTES.NAME]: renderName,
  [ATTRIBUTES.COMMENTS]: renderComments,
  [ATTRIBUTES.STATE]: renderState,
  [ATTRIBUTES.EDITABLE_PRICE]: renderEditablePrice,
  [ATTRIBUTES.PRICE]: renderPrice,
  [ATTRIBUTES.COST]: renderCost,
  [ATTRIBUTES.FRACTION_CONFIG]: renderFractionConfig,
  [ATTRIBUTES.TAGS]: renderTags,
  [ATTRIBUTES.INACTIVE_REASON]: renderInactiveReason,
};

const ProductChanges = ({ product }) => {
  const { createdAt, createdBy, previousVersions = [] } = product ?? {};

  const fullHistory = [...previousVersions, { ...product }];
  const reconstructedVersions = fullHistory
    .slice()
    .reverse()
    .reduce((acc, curr, index) => {
      const nextVersion = { ...acc[index - 1] };
      delete nextVersion.updatedBy;
      delete nextVersion.updatedAt;
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
      {createdAt && (
        <li>
          <strong>
            Producto creado el {getFormatedDate(createdAt, DATE_FORMATS.DATE_WITH_TIME)} {createdBy && `por ${createdBy}`}
          </strong>
        </li>
      )}

      {historyToRender.map(({ version, prevVersion }, index) => {
        const changes = [];

        Object.entries(renderFunctions).forEach(([key, renderer]) => {
          const oldValue = prevVersion[key];
          const newValue = version[key];

          const hasChanged = !isEqual(oldValue, newValue);

          if (hasChanged) {
            changes.push(renderer({ oldValue, newValue }));
          }
        });

        if (!changes.length) return null;

        const date = version.updatedAt
          ? getFormatedDate(version.updatedAt, DATE_FORMATS.DATE_WITH_TIME)
          : `Sin fecha`;
        const updatedBy = prevVersion?.updatedBy;

        return (
          <FlexColumn key={index}>
            <Divider />
            <MessageItem>
              <strong>🕒 {date} {updatedBy && `por ${updatedBy}`}</strong>
              <FlexColumn $margin="5px 0 0 1.5rem!important" $rowGap="5px">
                {changes}
              </FlexColumn>
            </MessageItem>
          </FlexColumn>
        );
      })}
    </List>
  );
};

export default ProductChanges;
