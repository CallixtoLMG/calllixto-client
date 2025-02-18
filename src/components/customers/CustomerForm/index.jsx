import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, Label } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CUSTOMER } from "../customers.constants";

const CustomerForm = ({ customer, onSubmit, isLoading, isUpdating, view, tags, isCustomerSettingsFetching }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);
  const [localCustomer, setLocalCustomer] = useState(customer);

  // VER HANDLERESET Y EL CREATE
  const handleReset = useCallback((customer) => {
    reset(customer);
  }, [reset]);

  const handleCreate = (data) => {
    const { previousVersions, ...filteredData } = data;

    const selectedTags = data.tags || [];

    filteredData.tags = selectedTags.map((tag) =>
      typeof tag === "string" ? JSON.parse(tag) : tag
    );

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
    const updatedCustomer = { ...localCustomer, tags: filteredData.tags };
    setLocalCustomer(updatedCustomer);
  };

  const tagsOptions = tags?.map(tag => ({
    ...tag,
    content: <Label color={tag?.value?.color}>{tag?.value?.name}</Label>,
  }));

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
            width="40%"
            name="tags"
            label="Etiquetas"
            placeholder="Selecciona etiquetas"
            height="fit-content"
            multiple
            clearable
            search
            selection
            defaultValue={customer?.tags}
            // disabled={true}
            loading={isCustomerSettingsFetching}
            options={tagsOptions}
            renderLabel={(item) => {
              return {
                color: item.value.color,
                content: item.text,
              }
            }}
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
