import { IconedButton } from "@/common/components/buttons";
import { Flex, Form } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { COLORS, DATE_FORMATS, ICONS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import { FormProvider, useForm } from "react-hook-form";
import { BUDGETS_HISTORY_DATE_RANGE } from "../budgets.constants";

const BudgetsHistoryFilter = ({ onSearch, isLoading }) => {
  const form = useForm();
  const { setValue, getValues, resetField } = form;

  const handlePresetChange = (months) => {
    setValue("presetDays", months);

    const option = BUDGETS_HISTORY_DATE_RANGE.find(opt => opt.value === months);

    if (!option || typeof option.getRange !== "function") {
      resetField("startDate");
      resetField("endDate");
      return;
    }

    const { startDate, endDate } = option.getRange();

    setValue("startDate", startDate);
    setValue("endDate", endDate);
  };

  const handleDateChange = (name, value) => {
    setValue(name, value);
    setValue("presetDays", null);
  };

  const handleClear = () => {
    resetField("startDate");
    resetField("endDate");

    setValue("presetDays", null);
    setTimeout(() => {
      resetField("presetDays");
    }, 0);

    onSearch({ startDate: null, endDate: null });
  };

  const handleSearch = () => {
    const { startDate, endDate } = getValues();

    const formattedStart = startDate ? getFormatedDate(startDate, DATE_FORMATS.ISO) : null;
    const formattedEnd = endDate ? getFormatedDate(endDate, DATE_FORMATS.ISO) : null;

    onSearch({
      startDate: formattedStart,
      endDate: formattedEnd,
    });
  };

  return (
    <FormProvider {...form}>
      <Form>
        <Flex $columnGap="15px" $rowGap="15px">
          <DropdownControlled
            width="fit-content"
            name="presetDays"
            label="Elegir un rango rápido"
            placeholder="Último mes, 3 meses, etc."
            options={BUDGETS_HISTORY_DATE_RANGE.map(({ label, value }) => ({ text: label, value }))}
            afterChange={handlePresetChange}
          />
          <Flex $columnGap="15px">
            <DatePickerControlled
              name="startDate"
              label="Desde"
              placeholder="Ej: 10-5-2025"
              dateFormat="dd-MM-yyyy"
              afterChange={(date) => handleDateChange("startDate", date)}
              width="fit-content"
            />
            <DatePickerControlled
              width="fit-content"
              name="endDate"
              label="Hasta"
              placeholder="Ej: 10-10-2025"
              dateFormat="dd-MM-yyyy"
              afterChange={(date) => handleDateChange("endDate", date)}
            />
            <Flex $columnGap="15px" $alignItems="end">
              <IconedButton
                disabled={isLoading}
                isLoading={isLoading}
                height="38px"
                text="Pedir datos"
                icon={ICONS.SEARCH}
                color={COLORS.BLUE}
                onClick={handleSearch}
              />
              <IconedButton
                height="38px"
                text="Limpiar"
                icon={ICONS.UNDO}
                onClick={handleClear}
                disabled={isLoading}
              />
            </Flex>
          </Flex>
        </Flex>
      </Form>
    </FormProvider>
  );
};

export default BudgetsHistoryFilter;
