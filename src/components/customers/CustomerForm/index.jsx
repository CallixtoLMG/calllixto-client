import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel } from "@/components/common/custom";
import { ContactFields, ControlledComments } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
const EMPTY_CUSTOMER = { name: '', phoneNumbers: [], addresses: [], emails: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, isUpdating, tags }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const [localCustomer, setLocalCustomer] = useState(customer);

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

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_CUSTOMER, ...customer } : EMPTY_CUSTOMER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <FormField width="33%" error={errors?.name?.message}>
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" onKeyPress={preventSend} />}
            />
          </FormField>
        </FieldsContainer>
        <ContactFields />
        <FieldsContainer>
          <FormField flex="1" >
            <RuledLabel title="Etiquetas" />
            <Controller
              name="tags"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Dropdown
                  padding="10px"
                  select
                  inputHeight="50px"
                  placeholder="Selecciona etiquetas"
                  multiple
                  search
                  selection
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
                  value={value.map((tag) => JSON.stringify(tag))}
                  onChange={(_, data) => {
                    const selectedTags = data.value.map((item) => JSON.parse(item));
                    onChange(selectedTags);
                  }}
                  renderLabel={(label) => ({
                    color: filteredTags.find((tag) => tag.name === label.text)?.color || 'grey',
                    content: label.text,
                  })}
                />
              )}
            />
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
          <ControlledComments control={control} />
        </FieldsContainer>
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_CUSTOMER, ...customer } : EMPTY_CUSTOMER)}
        />
      </Form>
    </FormProvider>
  )
};

export default CustomerForm;
