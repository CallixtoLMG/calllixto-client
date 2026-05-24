import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField } from "@/common/components/custom";
import { TextAreaControlled, TextControlled } from "@/common/components/form";
import { FIELD_LABELS, RULES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
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
          <FormField flex="1">
            <TextControlled
              name="id"
              label={FIELD_LABELS.ID}
              placeholder="CX"
              rules={RULES.REQUIRED_TWO_DIGIT}
              onChange={value => value.toUpperCase()}
              disabled={view}
              maxLength={2}
              required
            />
          </FormField>
          <FormField flex="1">
            <TextControlled
              name="name"
              label={FIELD_LABELS.NAME}
              placeholder="CallixtoGLM"
              dataTestId="brand-name-field"
              rules={RULES.REQUIRED}
              disabled={view && !isUpdating}
              required
            />
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        <TextAreaControlled name="comments" label={FIELD_LABELS.COMMENTS} placeholder="Una marca macanuda" readOnly={view && !isUpdating} />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(brand))}
            disabled={isDeletePending}
            submit
          />
        )}
      </Form>
    </FormProvider>
  )
});

BrandForm.displayName = "BrandForm";

export default BrandForm;
