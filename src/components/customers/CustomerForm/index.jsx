import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { useArrayTags, useKeyboardShortcuts } from "@/hooks";
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
  const { tagsOptions, optionsMapper } = useArrayTags(
    ENTITIES.CUSTOMERS,
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
        <FieldsContainer>
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
        </FieldsContainer>
        {isUpdating || !view
          ? <ContactControlled />
          : <ContactView phoneNumbers={phones} addresses={addresses} emails={emails} />}
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
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" readOnly={!isUpdating && view} />
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
