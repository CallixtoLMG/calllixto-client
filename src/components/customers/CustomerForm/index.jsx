import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { CONTENT_SIZES, ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { useKeyboardShortcuts, useSettingArrayField } from "@/hooks";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CUSTOMER } from "../customers.constants";

const CustomerForm = forwardRef(({
  customer, onSubmit, isLoading, isUpdating, view, isDeletePending },
  ref) => {
  const getInitialValues = (customer) => ({ ...EMPTY_CUSTOMER, tags: [], ...customer });

  const methods = useForm({
    defaultValues: getInitialValues(customer),
  });

  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleCreate)(),
    resetForm: () => reset(getInitialValues(customer))
  }));
  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);
  const { options: tagsOptions, optionsMapper } = useSettingArrayField(
    ENTITIES.CUSTOMER,
    "tags",
    customer?.tags || []
  );

  const handleCreate = (data) => {
    const { previousVersions, ...filteredData } = data;

    if (!filteredData.addresses.length) {
      filteredData.addresses = [];
    }
    if (!filteredData.phoneNumbers.length) {
      filteredData.phoneNumbers = [];
    }
    if (!filteredData.emails.length) {
      filteredData.emails = [];
    }

    onSubmit(filteredData);
    reset(filteredData);
  };

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleCreate),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(customer)),
      condition: validateShortcuts.canReset,
    }
  ]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)} onKeyDown={preventSend}>
        <FieldsContainer $columnGap="15px">
          <FormField flex="1">
            <TextControlled
              name="name"
              label="Nombre"
              placeholder="Martín Bueno"
              dataTestId="customer-name-field"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1" />
          <FormField flex="1" />
        </FieldsContainer>
        {isUpdating || !view
          ? <ContactControlled />
          : <ContactView phoneNumbers={phones} addresses={addresses} emails={emails} />}
        <FieldsContainer $columnGap="15px">
          <FormField flex="1">
            <DropdownControlled
              disabled={!isUpdating && view}
              name="tags"
              label="Etiquetas"
              placeholder="Selecciona etiquetas"
              height={CONTENT_SIZES.FIT}
              multiple
              clearable={isUpdating && !view}
              icon={(!isUpdating && view) ? null : undefined}
              search={isUpdating && !view}
              selection
              optionsMapper={optionsMapper}
              noResultsMessage="No hay opciones disponibles"
              options={Object.values(tagsOptions)}
              renderLabel={(item) => ({
                color: item.value.color,
                content: item.value.name,
              })}
            />
          </FormField>
          <FormField flex="1" />
          <FormField flex="1" />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" placeholder="No era tan bueno" readOnly={!isUpdating && view} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(customer))}
            disabled={isDeletePending}
            submit
          />
        )}
      </Form>
    </FormProvider>
  )
});

CustomerForm.displayName = "CustomerForm";

export default CustomerForm;
