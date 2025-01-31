import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form } from "@/components/common/custom";
import { ContactControlled, ContactView, TextAreaControlled, TextControlled } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_CUSTOMER } from "../customers.common";

const CustomerForm = ({ customer, onSubmit, isLoading, isUpdating, view }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);

  useKeyboardShortcuts(handleSubmit(onSubmit), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => reset({ ...EMPTY_CUSTOMER, ...customer }), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
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
