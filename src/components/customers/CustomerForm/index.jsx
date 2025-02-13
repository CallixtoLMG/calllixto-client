import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Label } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback, useMemo, useState } from "react";
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
  console.log(localCustomer)

  // VER QUE ONDA HANDLERESET Y EL CREATE
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
    const updatedCustomer = { ...localCustomer, tags: filteredData.tags };
    setLocalCustomer(updatedCustomer);
  };

  const filteredTags = useMemo(() => {
    const customerTagNames = localCustomer?.tags?.map((tag) => tag.name) || [];
    const uniqueTags = tags?.filter((tag) => !customerTagNames.includes(tag.name)) || [];
    return [...(localCustomer?.tags || []), ...uniqueTags];
  }, [tags, localCustomer]);

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
        {isUpdating || !view ? <ContactControlled /> : <ContactView phoneNumbers={phones} addresses={addresses} emails={emails} />}
        <FieldsContainer>
          <FormField flex="1" >
            {/* {console.log(filteredTags)} */}
            <DropdownControlled
              width="40%"
              name="tags"
              label="Etiquetas"
              placeholder="Selecciona etiquetas"
              height="fit-content"
              multiple
              search
              selection
              loading={isCustomerSettingsFetching}

              options={filteredTags?.map((tag) => ({
                key: tag.name,
                value: JSON.stringify(tag),
                text: tag.name,
                content: (
                  <Label color={tag.color} >
                    {tag.name}
                  </Label>
                ),
              }))}
              afterChange={(data) => {
                const selectedTags = data.map((item) => JSON.parse(item));
                return selectedTags
              }}
              renderLabel={(label) => ({
                color: filteredTags.find((tag) => tag.name === label.text)?.color || 'grey',
                content: label.text,
              })}
            />
          </FormField>
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
