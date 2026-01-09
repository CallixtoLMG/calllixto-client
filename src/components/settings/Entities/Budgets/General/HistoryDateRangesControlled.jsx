import { IconedButton } from "@/common/components/buttons";
import { FlexColumn, Icon } from "@/common/components/custom";
import { DropdownField } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BASE_HISTORY_RANGES, BUDGETS_RANGE_DATE_UNIT_CONFIG, BUDGETS_RANGE_DATE_UNIT_OPTIONS } from "@/components/settings/settings.constants";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Form, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { Label, List, ListItem } from "./styles";

const getRangeLabel = ({ value, unit }) => {
  if (!unit || !value) return "";
  const config = BUDGETS_RANGE_DATE_UNIT_CONFIG[unit];
  const num = Number(value);

  return num === 1
    ? `${config.article.singular} ${config.singular}`
    : `${config.article.plural} ${num} ${config.plural}`;
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
        text: v === 1
          ? `1 ${BUDGETS_RANGE_DATE_UNIT_CONFIG[unit].singular}`
          : `${v} ${BUDGETS_RANGE_DATE_UNIT_CONFIG[unit].plural}`,
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
        <Label> Opciones de fechas Historial Ventas</Label>
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
              text="Agregar"
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              onClick={() => setOpen(true)}
            />
          </div>
        }
        open={open}
        on="click"
        position="top left"
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
              label="Unidad"
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
              label="Cantidad"
              placeholder="Seleccione cantidad"
              options={valueOptions}
              value={value}
              selection
              disabled={!unit}
              onChange={(_, data) => setValue(data.value)}
            />
            <IconedButton
              text="Agregar"
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
