import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel } from "@/components/common/custom";
import { ContactFields, ControlledComments } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
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
