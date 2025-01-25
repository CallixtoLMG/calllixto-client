import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form } from "@/components/common/custom";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ControlledComments, ControlledInput } from "../../common/form";

const EMPTY_BRAND = { name: '', id: '', comments: '' };

const BrandForm = ({ brand, onSubmit, isLoading, isUpdating }) => {
  const methods = useForm({ defaultValues: brand });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const handleReset = useCallback((brand) => {
    reset(brand);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : EMPTY_BRAND), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
        <FieldsContainer>
          <ControlledInput
            width="150px"
            name="id"
            label="Código"
            placeholder="Código (A1)"
            rules={RULES.REQUIRED_TWO_DIGIT}
            onChange={(e) => e.target.value.toUpperCase()}
            disabled={isUpdating}
            maxLength={2}
          />
          <ControlledInput
            width="40%"
            name="name"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
          />
        </FieldsContainer>
        <ControlledComments />
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : EMPTY_BRAND)}
        />
      </Form>
    </FormProvider>
  )
};

export default BrandForm;
