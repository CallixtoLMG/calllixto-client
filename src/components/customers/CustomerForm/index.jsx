import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { ENTITIES, RULES, SHORTKEYS } from "@/common/constants";
import { useArrayTags } from "@/hooks/arrayTags";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CUSTOMER } from "../customers.constants";

const CustomerForm = ({ customer, onSubmit, isLoading, isUpdating, view }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });

  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);
  const { data: customersSettings, isFetching: isCustomerSettingsFetching } = useGetSetting(ENTITIES.CUSTOMERS);
  const { tagsOptions, optionsMapper } = useArrayTags(ENTITIES.CUSTOMERS, customersSettings);

  const handleReset = useCallback((customer) => {
    reset(customer);
  }, [reset]);

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
  };

  useKeyboardShortcuts(handleSubmit(handleCreate), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset({ ...EMPTY_CUSTOMER, ...customer }), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
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
            loading={isCustomerSettingsFetching}
            options={Object.values(tagsOptions)}
            renderLabel={(item) => ({
              color: item.value.color,
              content: item.value.name,
            })}
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" disabled={!isUpdating && view} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset({ ...EMPTY_CUSTOMER, ...customer })}
          />
        )}
      </Form>
    </FormProvider>
  )
};

export default CustomerForm;
