import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Input } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, PriceControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { getDateWithOffset, now } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks";
import useSettingArrayField from "@/hooks/useSettingArrayField";
import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EMPTY_EXPENSE = { name: '', comments: '', category: '', tags: '', amount: '', expiration: '' };

const CATEGORY_OPTIONS = [
  { key: "office", text: "Oficina", value: "office" },
  { key: "travel", text: "Viajes", value: "travel" },
  { key: "misc", text: "Varios", value: "misc" },
];

const ExpenseForm = forwardRef(({
  expense, onSubmit, isLoading, isUpdating, view },
  ref) => {
  console.log(expense)
  const getInitialValues = (expense) => ({
    ...EMPTY_EXPENSE,
    ...expense,
  });
  const methods = useForm({
    defaultValues: getInitialValues(expense)
  });
  const { data: expensesSettings, isFetching: isExpensesSettingsFetching, refetch: refetchExprensesSettings } = useGetSetting(ENTITIES.EXPENSES);
  console.log(expensesSettings)
  const { options: tagsOptions, optionsMapper } = useSettingArrayField(ENTITIES.EXPENSES, "tags", expense?.tags || []);
  const { options: categoryOptions } = useSettingArrayField(ENTITIES.EXPENSES, "categories", []);

  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleCreate)(),
    resetForm: () => reset(getInitialValues(expense))
  }));
  const [watchExpiration] = watch([
    "expiration"
  ]);

  const handleReset = useCallback((expense) => {
    reset({ ...EMPTY_EXPENSE, ...expense });
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  useEffect(() => {
    refetchExprensesSettings();
  }, [refetchExprensesSettings]);

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)} onKeyDown={preventSend}>
        <FieldsContainer $rowGap="5px">
          {view &&
            <TextField
              width="250px"
              label="Código"
              value={expense?.id}
              disabled
            />
          }
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
        </FieldsContainer>
        <FieldsContainer $rowGap="5px">
          <PriceControlled
            width="20%"
            name="amount"
            label="Monto"
            disabled={!isUpdating && view}
          />
          <DropdownControlled
            disabled={!isUpdating && view}
            width={(!isUpdating && view) ? "fit-content" : "40%"}
            name="categories"
            label="Categorias"
            placeholder="Selecciona categorias"
            height="fit-content"
            multiple
            clearable={isUpdating && !view}
            icon={(!isUpdating && view) ? null : undefined}
            search={isUpdating && !view}
            selection
            optionsMapper={optionsMapper}
            loading={isExpensesSettingsFetching}
            options={Object.values(categoryOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
          />
          {/* < DropdownControlled
            width="30%"
            name="category"
            label="Categoría"
            icon={(!isUpdating && view) ? null : undefined}
            defaultValue={expense?.category || "misc"}
            rules={RULES.REQUIRED}
            options={CATEGORY_OPTIONS}
            disabled={!isUpdating && view}
          /> */}
          <NumberControlled
            width="200px"
            name="expiration"
            rules={RULES.REQUIRED}
            maxLength={3}
            label="Dias para el vencimiento"
            placeholder="Cantidad en días"
          />
          <FormField
            $width="200px"
            label="Fecha de vencimiento"
            control={Input}
            readOnly
            value={
              watchExpiration
                ? getDateWithOffset(now(), watchExpiration, "days")
                : ""
            }
            placeholder="dd/mm/aaaa"
          />
        </FieldsContainer>
        <FieldsContainer $rowGap="5px">
          <DropdownControlled
            disabled={!isUpdating && view}
            width={(!isUpdating && view) ? "fit-content" : "40%"}
            name="tags"
            label="Etiquetas"
            placeholder="Selecciona etiquetas"
            height="fit-content"
            multiple
            clearable={isUpdating && !view}
            icon={(!isUpdating && view) ? null : undefined}
            search={isUpdating && !view}
            selection
            optionsMapper={optionsMapper}
            loading={isExpensesSettingsFetching}
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextAreaControlled name="comments" label="Comentarios" readOnly={!isUpdating && view} />
        </FieldsContainer>
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE)}
            submit
          />
        )}
      </Form>
    </FormProvider>
  );
});

ExpenseForm.displayName = "ExpenseForm";

export default ExpenseForm;