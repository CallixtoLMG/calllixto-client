import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form } from "@/components/common/custom";
import { ContactFields, ControlledTextArea, ControlledText } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
const EMPTY_CUSTOMER = { name: '', phoneNumbers: [], addresses: [], emails: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, isUpdating }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;

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
          <ControlledText width="40%"name="name" label="Nombre" placeholder="Nombre" rules={RULES.REQUIRED} />
        </FieldsContainer>
        <ContactFields />
        <ControlledTextArea name="comments" />
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
