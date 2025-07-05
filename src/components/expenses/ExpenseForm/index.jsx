import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Input } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, PriceControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { getDateWithOffset, now } from "@/common/utils/dates";
import { useArrayTags, useKeyboardShortcuts } from "@/hooks";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EMPTY_EXPENSE = { id: '', name: '', comments: '', category: '', paymentDetails: '', tags: '', amount: '', expiration: '' };

const CATEGORY_OPTIONS = [
  { key: "office", text: "Oficina", value: "office" },
  { key: "travel", text: "Viajes", value: "travel" },
  { key: "misc", text: "Varios", value: "misc" },
];

const ExpenseForm = ({ expense, onSubmit, isLoading, isUpdating, view }) => {

  const getInitialValues = (expense) => ({

  });
  const methods = useForm({
    defaultValues: getInitialValues(expense)
  });
  const { data: expensesSettings, isFetching: isExpensesSettingsFetching, refetch: refetchExprensesSettings } = useGetSetting(ENTITIES.EXPENSES);

  const { tagsOptions, optionsMapper } = useArrayTags(
    ENTITIES.EXPENSES,
    expense?.tags || []
  );
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const watchExpiration = watch("expiration");
  const handleReset = useCallback((expense) => {
    reset(expense);
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
          <TextControlled
            width="25%"
            name="name"
            label="Nombre"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
          <DropdownControlled
            width="30%"
            name="category"
            label="Categoría"
            icon={(!isUpdating && view) ? null : undefined}
            defaultValue={expense?.category || "misc"}
            rules={RULES.REQUIRED}
            options={CATEGORY_OPTIONS}
            disabled={!isUpdating && view}
          />

          <PriceControlled
            width="20%"
            name="amount"
            label="Monto"
            disabled={!isUpdating && view}
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
        <FieldsContainer>
          <TextAreaControlled name="paymentDetails" label="Detalles de pago" readOnly={!isUpdating && view} />
        </FieldsContainer>
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE)}
          submit
        />
      </Form>
    </FormProvider>
  );
};

export default ExpenseForm;