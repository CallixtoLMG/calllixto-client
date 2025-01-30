import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form } from "@/components/common/custom";
import { ContactControlled, ContactView, TextAreaControlled, TextControlled } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_SUPPLIER } from "../suppliers.common";

const SupplierForm = ({ supplier, onSubmit, isUpdating, isLoading, view }) => {
  const methods = useForm({ defaultValues: supplier });
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);

  useKeyboardShortcuts(handleSubmit(onSubmit), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => reset({ ...EMPTY_SUPPLIER, ...supplier }), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
        <FieldsContainer>
          <TextControlled
            width="150px"
            name="id"
            label="Código"
            placeholder="Código (A1)"
            rules={RULES.REQUIRED_TWO_DIGIT}
            onChange={value => value.toUpperCase()}
            disabled={view}
            maxLength={2}
          />
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
        </FieldsContainer>
        {(!view || isUpdating) ? <ContactControlled /> : <ContactView phoneNumbers={phones} addresses={addresses} emails={emails} />}
        <TextAreaControlled name="comments" label="Comentarios" disabled={!isUpdating && view} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset({ ...EMPTY_SUPPLIER, ...supplier })}
          />
        )}
      </Form>
    </FormProvider>
  )
};

export default SupplierForm;
