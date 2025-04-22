import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_BRAND } from "../brands.constants";

const BrandForm = forwardRef(({
  brand, onSubmit, isUpdating, isLoading, view, isDeletePending
}, ref) => {
  const getInitialValues = (brand) => ({ ...EMPTY_BRAND, ...brand });
  const methods = useForm({
    defaultValues: getInitialValues(brand)
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleForm)(),
    resetForm: () => reset(getInitialValues(brand))
  }));

  const handleForm = async (data) => {
    await onSubmit(data);
    reset(data);
  };

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
      action: () => reset(getInitialValues(brand)),
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
            disabled={view && !isUpdating}
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" disabled={view && !isUpdating} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(brand))}
            disabled={isDeletePending}
          />
        )}
      </Form>
    </FormProvider>
  )
});

BrandForm.displayName = "BrandForm";

export default BrandForm;
