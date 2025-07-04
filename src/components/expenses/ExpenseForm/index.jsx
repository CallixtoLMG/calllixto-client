import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Input } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, PriceControlled, TextAreaControlled } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { getDateWithOffset, now } from "@/common/utils/dates";
import { useArrayTags, useKeyboardShortcuts } from "@/hooks";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

const EMPTY_EXPENSE = { id: '', name: '', comments: '', category: '', paymentDetails: '', tags: '', amount: '', expiration: '' };

const CATEGORY_OPTIONS = [
  { key: "office", text: "Oficina", value: "office" },
  { key: "travel", text: "Viajes", value: "travel" },
  { key: "misc", text: "Varios", value: "misc" },
];

const ExpenseForm = ({ expense, onSubmit, isLoading, isUpdating, view }) => {
  const { handleSubmit, control, watch, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...EMPTY_EXPENSE,
      ...expense,
    },
  });
  const { data: expensesSettings, isFetching: isExpensesSettingsFetching, refetch: refetchExprensesSettings } = useGetSetting(ENTITIES.EXPENSES);

  const watchExpiration = watch("expiration");
  const { tagsOptions, optionsMapper } = useArrayTags(
    ENTITIES.EXPENSES,
    expense?.tags || []
  );

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
    <Form onSubmit={handleSubmit(handleCreate)} onKeyDown={preventSend}>
      <FieldsContainer rowGap="5px">
        {/* <TextControlled
          width="25%"
          name="Código"
          label="Usuario"
          placeholder="nombre@empresa.com"
          rules={{
            required: "Este campo es obligatorio.",
            // validate: {
            //   email: (value) => validateEmail(value) || "El correo electrónico no es válido.",
            // },
          }}
          disabled={view}
          iconLabel
          popupPosition="bottom left"
          showPopup
          popupContent="Introduce el email del usuario."
        /> */}
        {/* {isUpdating ? (
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
        )} */}
        {/* <TextControlled
          width="25%"
          name="name"
          label="Nombre"
          placeholder="Nombre"
          rules={RULES.REQUIRED}
          disabled={!isUpdating && view}
        /> */}
        {/* <FormField flex="1" error={errors?.name?.message}>
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          <Controller
            name="name"
            control={control}
            rules={RULES.REQUIRED}
            render={({ field }) => <Input {...field} placeholder="Nombre" />}
          />
        </FormField> */}
        <DropdownControlled
          width="30%"
          name="category"
          label="Categoría"
          icon={(!isUpdating && view) ? null : undefined}
          // defaultValue={value || ''}
          rules={RULES.REQUIRED}
          options={CATEGORY_OPTIONS}
          disabled={!isUpdating && view}
        />
        {/* <FormField width="30%">
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
        </FormField> */}
        <PriceControlled
          width="20%"
          name="amount"
          label="Monto"
          disabled={!isUpdating && view}
        />
        {/* <FormField width="20%">
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
        </FormField> */}
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        {/* <TextControlled
          name="paymentDetails"
          label="Detalles de pago"
          placeholder="Detalles de pago"
          rules={RULES.REQUIRED}
          disabled={!isUpdating && view}
        /> */}
        {/* <FormField flex="1">
          <RuledLabel title="Detalles de pago" />
          <Controller
            name="paymentDetails"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Detalles de pago" />}
          />
        </FormField> */}
        <FieldsContainer>
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
        {/* <FormField flex="1">
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
        </FormField> */}
        <FieldsContainer>
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
        {/* <FormField flex="1">
          <RuledLabel title="Vencimiento" />
          <Controller
            name="expiration"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Vencimiento" />}
          />
        </FormField> */}
      </FieldsContainer>
      <FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" readOnly={!isUpdating && view} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_EXPENSE, ...expense } : EMPTY_EXPENSE)}
        submit
      />
    </Form>
  );
};

export default ExpenseForm;