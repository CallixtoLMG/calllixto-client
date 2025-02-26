import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, Label } from "@/common/components/custom";
import { ContactControlled, ContactView, DropdownControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CUSTOMER } from "../customers.constants";

const CustomerForm = ({ customer, onSubmit, isLoading, isUpdating, view, tags = [], isCustomerSettingsFetching }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const [phones, addresses, emails, watchTags] = watch(['phoneNumbers', 'addresses', 'emails', "tags"]);
  const [localCustomer, setLocalCustomer] = useState(customer);
  const defaultSelectedTags = customer?.tags?.map(tag => tag.name) || [];

  const [tagsOptions, optionsMapper] = useMemo(() => {
    const uniqueTags = {};

    [...tags, ...(customer?.tags ?? [])].forEach((tag) => {
      
      if (!uniqueTags[tag.name]) {
        uniqueTags[tag.name] = tag;

      }
    });

    console.log("uniqueTags", uniqueTags)
    const options = Object.values(uniqueTags).map((tag) => ({
      key: tag.name,
      value: tag.name,
      text: tag.name,
      content: <Label color={tag.color}>{tag.name}</Label>,
    }))
    return [options, uniqueTags];
  }, [tags, customer?.tags]);



  const Alloptions = Object.values(tags).map((tag) => ({
    key: tag.name,
    value: tag.name,
    text: tag.name,
    content: <Label color={tag.color}>{tag.name}</Label>,
  }))

  console.log("tagsOptions", tagsOptions)
  console.log("Alloptions", Alloptions)
  console.log("tags", tags)

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
            // disabled={!isUpdating}
            width="40%"
            name="tags"
            label="Etiquetas"
            placeholder="Selecciona etiquetas"
            height="fit-content"
            multiple
            clearable
            search
            selection
            optionsMapper={optionsMapper}
            defaultValue={defaultSelectedTags}
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
