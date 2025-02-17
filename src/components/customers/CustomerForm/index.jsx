import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Label, Segment } from "@/common/components/custom";
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
  const selectedTags = watch("tags") || [];

  console.log("🟢 [CustomerForm] selectedTags en watch:", selectedTags);
  console.log("🟢 [CustomerForm] tags disponibles:", tags);
  console.log("🟢 [CustomerForm] customer.tags iniciales:", customer?.tags);
  // console.log("customer", customer)

  // VER QUE ONDA HANDLERESET Y EL CREATE
  const handleReset = useCallback((customer) => {
    reset(customer);
  }, [reset]);

  const handleCreate = (data) => {
    const { previousVersions, ...filteredData } = data;

    // Obtener las etiquetas seleccionadas desde el formulario
    const selectedTags = data.tags || [];

    // Convertirlas correctamente en objetos
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

    console.log("filteredData", filteredData); // Verifica qué etiquetas se están enviando
    onSubmit(filteredData);
    const updatedCustomer = { ...localCustomer, tags: filteredData.tags };
    setLocalCustomer(updatedCustomer);
  };

  const filteredTags = useMemo(() => {
    const customerTagNames = customer?.tags?.map(tag => tag.name) || [];
    const uniqueTags = tags?.filter(tag => !customerTagNames.includes(tag.name)) || [];
    return [...(customer?.tags || []), ...uniqueTags];
  }, [tags, customer]);

  const dropdownOptions = filteredTags.map(tag => ({
    key: tag.name,
    value: JSON.stringify(tag), // ✅ Asegura que `options` sean JSON
    text: tag.name,
    content: <Label color={tag.color}>{tag.name}</Label>,
  }));

  console.log("✅ [CustomerForm] availableTags después del filtrado:", filteredTags);

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
          <FormField flex="1" >
            {/* {console.log(filteredTags)} */}
            {isUpdating || !view
              ?
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
                options={dropdownOptions}
                afterChange={(selectedTags) => {
                  console.log("✅ [CustomerForm] afterChange - selectedTags:", selectedTags);
                  methods.setValue("tags", selectedTags);
                }}
                renderLabel={(label) => ({
                  color: filteredTags.find(tag => tag.name === label.text)?.color || 'grey',
                  content: label.text,
                })}
              />
              : <Segment width="fit-content" height="38px" padding="5px">
                {customer?.tags?.map((tag) => (
                  <Label margin="0 5px 0 0" width="fit-content" key={tag.name} color={tag.color}>
                    {tag.name}
                  </Label>
                ))}
              </Segment>}
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
