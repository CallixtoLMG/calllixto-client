import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField } from "@/common/components/custom";
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
        <FieldsContainer $columnGap="15px">
          <FormField flex="1">
            <TextControlled
              name="id"
              label="Id"
              placeholder="A1"
              rules={RULES.REQUIRED_TWO_DIGIT}
              onChange={value => value.toUpperCase()}
              disabled={view}
              maxLength={2}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1">
            <TextControlled
              name="name"
              label="Nombre"
              placeholder="Suministro Estrella"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        {(!view || isUpdating) ? <ContactControlled /> : <ContactView phoneNumbers={phones} addresses={addresses} emails={emails} />}
        <TextAreaControlled name="comments" label="Comentarios" placeholder="Siempre demora en los pedidos" readOnly={!isUpdating && view} />
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
    </FormProvider >
  )
});

SupplierForm.displayName = "SupplierForm";

export default SupplierForm;
