import { IconedButton } from "@/common/components/buttons";
import { Flex, Form } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import { DatePickerControlled } from "@/common/components/form/DatePicker/DatePickerControlled";
import { CONTENT_SIZES, COLORS, ICONS } from "@/common/constants";
import { getDateUTC } from "@/common/utils/dates";
import { FormProvider, useForm } from "react-hook-form";

const BudgetsHistoryFilter = ({
  onSearch,
  isLoading,
  defaultValues,
  presets,
}) => {
  const form = useForm({ defaultValues });
  const { setValue, getValues, resetField } = form;
  const handlePresetChange = (presetValue) => {
    setValue("presetDays", presetValue);

    const option = presets.find(opt => opt.value === presetValue);

    if (!option?.getRange) {
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
    setValue("startDate", null, { shouldDirty: true });
    setValue("endDate", null, { shouldDirty: true });

    setValue("presetDays", null);
    setTimeout(() => resetField("presetDays"), 0);

    onSearch({ startDate: null, endDate: null });
  };

  const handleSearch = () => {
    const { startDate, endDate } = getValues();
    if (!startDate && !endDate) return;

    onSearch({
      startDate: getDateUTC(startDate),
      endDate: getDateUTC(endDate),
    });
  };

  return (
    <FormProvider {...form}>
      <Form>
        <Flex $columnGap="15px" $rowGap="15px">
          <DropdownControlled
            width={CONTENT_SIZES.FIT}
            name="presetDays"
            label="Rangos predefinidos"
            placeholder="Hoy, esta semana, etc."
            options={presets.map(({ label, value }) => ({
              text: label,
              value,
            }))}
            afterChange={handlePresetChange}
          />
          <Flex $columnGap="15px">
            <DatePickerControlled
              name="startDate"
              label="Desde"
              dateFormat="dd-MM-yyyy"
              afterChange={(date) => handleDateChange("startDate", date)}
              width={CONTENT_SIZES.FIT}
            />
            <DatePickerControlled
              name="endDate"
              label="Hasta"
              dateFormat="dd-MM-yyyy"
              afterChange={(date) => handleDateChange("endDate", date)}
              width={CONTENT_SIZES.FIT}
            />
            <Flex $columnGap="15px" $alignItems="flex-end">
              <IconedButton
                disabled={isLoading}
                isLoading={isLoading}
                height="38px"
                text="Pedir datos de ventas"
                icon={ICONS.SEARCH}
                color={COLORS.BLUE}
                onClick={handleSearch}
                iconOnly
              />
              <IconedButton
                height="38px"
                text="Limpiar selección"
                icon={ICONS.UNDO}
                color={COLORS.ORANGE}
                onClick={handleClear}
                disabled={isLoading}
                iconOnly
              />
            </Flex>
          </Flex>
        </Flex>
      </Form>
    </FormProvider>
  );
};

export default BudgetsHistoryFilter;
