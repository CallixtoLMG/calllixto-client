import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, RuledLabel, Segment } from "@/components/common/custom";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { ControlledComments } from "../../common/form";

const EMPTY_EXPENSE = { id: '', name: '', comments: '', category: '', paymentDetails: '', tags: '', amount: '', expiration: '' };

const CATEGORY_OPTIONS = [
  { key: "office", text: "Oficina", value: "office" },
  { key: "travel", text: "Viajes", value: "travel" },
  { key: "misc", text: "Varios", value: "misc" },
];

const ExpenseForm = ({ expense, onSubmit, isLoading, isUpdating }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...EMPTY_EXPENSE,
      ...expense,
    },
  });

  const handleReset = useCallback((expense) => {
    reset(expense);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE), SHORTKEYS.DELETE);

  return (
    <Form onSubmit={handleSubmit(handleCreate)} onKeyDown={preventSend}>
      <FieldsContainer rowGap="5px">
        <FormField width="15%" error={errors?.id?.message}>
          <RuledLabel title="Código" message={errors?.id?.message} required={!isUpdating} />
          {isUpdating ? (
            <Segment placeholder>{expense?.id}</Segment>
          ) : (
            <Controller
              name="id"
              control={control}
              rules={RULES.REQUIRED_TWO_DIGIT}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Código"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              )}
            />
          )}
        </FormField>
        <FormField flex="1" error={errors?.name?.message}>
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          <Controller
            name="name"
            control={control}
            rules={RULES.REQUIRED}
            render={({ field }) => <Input {...field} placeholder="Nombre" />}
          />
        </FormField>
        <FormField width="30%">
          <RuledLabel title="Categoría" />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                selection
                options={CATEGORY_OPTIONS}
                placeholder="Selecciona una categoría"
                value={field.value || ''}
                onChange={(e, { value }) => field.onChange(value)}
              />
            )}
          />
        </FormField>
        <FormField width="20%">
          <RuledLabel title="Monto" message={errors?.amount?.message} required />
          <Controller
            name="amount"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CurrencyFormatInput
                textAlignLast="right"
                height="50px"
                displayType="input"
                thousandSeparator={true}
                decimalScale={2}
                allowNegative={false}
                prefix="$ "
                customInput={Input}
                onValueChange={value => {
                  onChange(value.floatValue);
                }}
                value={value || 0}
                placeholder="Monto"
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">

        <FormField flex="1">
          <RuledLabel title="Detalles de pago" />
          <Controller
            name="paymentDetails"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Detalles de pago" />}
          />
        </FormField>
        <FormField flex="1">
          <RuledLabel title="Etiquetas" />
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                multiple
                noResultsMessage="Sin resultados"
                search
                selection
                placeholder="Selecciona etiquetas"
                options={[
                  { key: "urgent", text: "Urgente", value: { key: "urgent", text: "Urgente", value: "urgent" } },
                  { key: "low_priority", text: "Baja Prioridad", value: { key: "low_priority", text: "Baja Prioridad", value: "low_priority" } },
                  { key: "finance", text: "Finanzas", value: { key: "finance", text: "Finanzas", value: "finance" } },
                ]}
                value={field.value || []}
                onChange={(e, { value }) => field.onChange(value)}
              />
            )}
          />
        </FormField>
        <FormField flex="1">
          <RuledLabel title="Vencimiento" />
          <Controller
            name="expiration"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Vencimiento" />}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <ControlledComments control={control} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE)}
      />
    </Form>
  );
};

export default ExpenseForm;
