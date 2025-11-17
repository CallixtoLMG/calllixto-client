import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { DropdownControlled, PriceControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { now } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks";
import useSettingArrayField from "@/hooks/useSettingArrayField";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DatePickerControlled } from "../../../common/components/form/DatePicker";
import { EMPTY_EXPENSE } from "../expenses.constants";

const ExpenseForm = forwardRef(({
  expense,
  onSubmit,
  isLoading,
  isUpdating,
  view,
  isCloning = false,
},
  ref) => {
  const getInitialValues = (expense) => ({
    ...EMPTY_EXPENSE,
    tags: [],
    categories: [],
    expirationDate: expense?.expirationDate ? expense?.expirationDate : now(),
    ...expense,
  });

  const clonedInitialValues = useMemo(() => {
    if (!isCloning || !expense) return EMPTY_EXPENSE;

    const { id, createdAt, createdBy, updatedAt, updatedBy, state, paymentsMade, ...rest } = expense;

    return {
      ...EMPTY_EXPENSE,
      ...rest,
      paymentsMade: [],
      categories: rest.categories || [],
      tags: rest.tags || [],
    };
  }, [expense, isCloning]);

  const methods = useForm({
    defaultValues: isCloning ? clonedInitialValues : getInitialValues(expense),
  });
  const { isFetching: isExpensesSettingsFetching, refetch: refetchExprensesSettings } = useGetSetting(ENTITIES.EXPENSE);
  const { options: tagsOptions, optionsMapper: tagsMapper } = useSettingArrayField(ENTITIES.EXPENSE, "tags", expense?.tags || []);
  const { options: categoryOptions, optionsMapper: categoriesMapper } = useSettingArrayField(ENTITIES.EXPENSE, "categories", expense?.categories || []);
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleForm)(),
    resetForm: () => reset(getInitialValues(expense)),
  }));

  useEffect(() => {
    reset(getInitialValues(expense));
    refetchExprensesSettings();
  }, [expense, refetchExprensesSettings, reset]);

  const handleReset = useCallback(() => {
    if (isCloning) {
      reset(clonedInitialValues);
    } else {
      reset({ ...EMPTY_EXPENSE, ...expense });
    }
  }, [reset, isCloning, clonedInitialValues, expense]);

  const handleForm = async (data) => {
    await onSubmit(data);
    reset(getInitialValues({ ...expense, ...data }));
  };

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleForm),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(expense)),
      condition: validateShortcuts.canReset,
    }
  ]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
        <FieldsContainer $rowGap="5px">
          {view &&
            <TextField
              width="200px"
              label="Id"
              value={expense?.id}
              disabled
            />
          }
          <TextControlled
            width="30%"
            name="name"
            label="Detalle"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
            placeholder="Netflix"
          />
          <PriceControlled
            width="15%"
            name="amount"
            label="Monto"
            disabled={!isUpdating && view}
            placeholder="18000"
          />
          <DatePickerControlled
            disabled={!isUpdating && view}
            name="expirationDate"
            label="Fecha de vencimiento"
            width="fit-content"
            showMonthDropdown
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={80}
            rules={RULES.REQUIRED}
            placeholder="16-11-2025"
          />
        </FieldsContainer>
        <FieldsContainer $rowGap="5px">
          <DropdownControlled
            disabled={!isUpdating && view}
            width={(!isUpdating && view) ? "fit-content" : "40%"}
            name="categories"
            label="Categorias"
            placeholder="Selecciona categorias"
            multiple
            clearable={isUpdating && !view}
            icon={(!isUpdating && view) ? null : undefined}
            search={isUpdating && !view}
            selection
            optionsMapper={categoriesMapper}
            loading={isExpensesSettingsFetching}
            options={Object.values(categoryOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
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
            optionsMapper={tagsMapper}
            loading={isExpensesSettingsFetching}
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextAreaControlled name="comments" label="Comentarios" placeholder="Quiero ver el Juego del Calamar temporada 2" readOnly={!isUpdating && view} />
        </FieldsContainer>
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isCloning ? true : isDirty}
            onReset={() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE)}
            submit
            cloningExpense
          />
        )}
      </Form>
    </FormProvider>
  );
});

ExpenseForm.displayName = "ExpenseForm";

export default ExpenseForm;