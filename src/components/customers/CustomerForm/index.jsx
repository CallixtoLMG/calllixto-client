import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, TextArea } from "@/components/common/custom";
import { ContactFields, ControlledComments } from "@/components/common/form";
import { RULES } from "@/constants";
import { useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

const EMPTY_CUSTOMER = { name: '', phoneNumbers: [], addresses: [], emails: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, isUpdating }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const handleReset = useCallback((customer) => {
    reset(customer);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <FormField width="33%">
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          </FormField>
        </FieldsContainer>
        <ContactFields />
        <FieldsContainer>
          <Label>Comentarios</Label>
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
