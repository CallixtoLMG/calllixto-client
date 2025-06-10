import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { ContactControlled, ContactView, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_SUPPLIER } from "../suppliers.constants";

const SupplierForm = forwardRef(({
  supplier, onSubmit, isUpdating, isLoading, view, isDeletePending
}, ref) => {
  const getInitialValues = (supplier) => ({ ...EMPTY_SUPPLIER, ...supplier });
  const methods = useForm({ defaultValues: getInitialValues(supplier) });
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleForm)(),
    resetForm: () => reset(getInitialValues(supplier))
  }));

  const handleForm = async (data) => {
    await onSubmit(data);
    reset(data);
  };

  const [phones, addresses, emails] = watch(['phoneNumbers', 'addresses', 'emails']);

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleForm),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(supplier)),
      condition: validateShortcuts.canReset,
    }
  ]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)}>
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
        <TextAreaControlled name="comments" label="Comentarios" readOnly={!isUpdating && view} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(supplier))}
            disabled={isDeletePending}
            submit
          />
        )}
      </Form>
    </FormProvider>
  )
});

SupplierForm.displayName = "SupplierForm";

export default SupplierForm;
