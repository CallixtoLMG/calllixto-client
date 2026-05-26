import { IconedButton } from "@/common/components/buttons";
import { FlexColumn, Icon } from "@/common/components/custom";
import { DropdownField } from "@/common/components/form";
import { POPUP_POSITIONS, BUTTON_TEXTS, COLORS, FIELD_LABELS, ICONS } from "@/common/constants";
import { formatCount, formatLastCount } from "@/common/utils/pluralization";
import SettingsFieldLabel from "@/components/settings/Common/SettingsFieldLabel";
import { BASE_HISTORY_RANGES, BUDGETS_RANGE_DATE_UNIT_CONFIG, BUDGETS_RANGE_DATE_UNIT_OPTIONS, SETTINGS_HELP_TEXTS } from "@/components/settings/settings.constants";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Form, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { Label, List, ListItem } from "./styles";

const getRangeLabel = ({ value, unit }) => {
  if (!unit || !value) return "";

  return formatLastCount(value, unit);
};

export const HistoryDateRangesControlled = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "historyDateRanges",
  });

  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState(null);
  const [value, setValue] = useState(null);

  const buttonRef = useRef(null);

  const valueOptions = useMemo(() => {
    if (!unit) return [];
    const max = BUDGETS_RANGE_DATE_UNIT_CONFIG[unit].max;

    return Array.from({ length: max }, (_, i) => {
      const v = i + 1;
      return {
        key: v,
        value: v,
        text: formatCount(v, unit),
      };
    });
  }, [unit]);

  const handleAdd = () => {
    if (!unit || !value) return;

    append({
      id: uuid(),
      value,
      unit,
    });

    setUnit(null);
    setValue(null);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <FlexColumn width="50%" $rowGap="15px">
      <FlexColumn>
        <Label>
          <SettingsFieldLabel helpText={SETTINGS_HELP_TEXTS.BUDGET_HISTORY_DATE_RANGES}>
            Opciones de fechas Historial Ventas
          </SettingsFieldLabel>
        </Label>
        <List divided verticalAlign="middle">
          {BASE_HISTORY_RANGES.map(range => (
            <ListItem key={range.key}>
              <List.Content>
                {range.label}
              </List.Content>
            </ListItem>
          ))}
          {fields.map((range, index) => (
            <ListItem key={range.id}>
              <List.Content floated="right">
                <Icon
                  pointer="true"
                  name={ICONS.TRASH}
                  color={COLORS.RED}
                  onClick={() => remove(index)}
                />
              </List.Content>
              <List.Content>{getRangeLabel(range)}</List.Content>
            </ListItem>
          ))}
        </List>
      </FlexColumn>
      <Popup
        trigger={
          <div ref={buttonRef}>
            <IconedButton
              text={BUTTON_TEXTS.ADD}
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              onClick={() => setOpen(true)}
            />
          </div>
        }
        open={open}
        on="click"
        position={POPUP_POSITIONS.TOP_LEFT}
        closeOnDocumentClick
        onClose={() => {
          setUnit(null);
          setValue(null);
          setOpen(false);
          buttonRef.current?.focus();
        }}
      >
        <Form>
          <FlexColumn $rowGap="10px" width="300px">
            <DropdownField
              label={FIELD_LABELS.UNIT}
              placeholder="Seleccione unidad"
              options={BUDGETS_RANGE_DATE_UNIT_OPTIONS}
              value={unit}
              selection
              onChange={(_, data) => {
                setUnit(data.value);
                setValue(null);
              }}
            />
            <DropdownField
              label={FIELD_LABELS.QUANTITY}
              placeholder="Seleccione cantidad"
              options={valueOptions}
              value={value}
              selection
              disabled={!unit}
              onChange={(_, data) => setValue(data.value)}
            />
            <IconedButton
              text={BUTTON_TEXTS.ADD}
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              disabled={!unit || !value}
              onClick={handleAdd}
            />
          </FlexColumn>
        </Form>
      </Popup>
    </FlexColumn>
  );
};
