import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form } from "@/components/common/custom";
import { ContactControlled, TextAreaControlled, TextControlled } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EMPTY_SUPPLIER = { id: '', name: '', emails: [], phoneNumbers: [], addresses: [], comments: '' };

const SupplierForm = ({ supplier, onSubmit, isUpdating, isLoading }) => {
  const methods = useForm({ defaultValues: supplier });

  const { handleSubmit, reset, formState: { isDirty } } = methods;

  const handleReset = useCallback((supplier) => {
    reset(supplier);
  }, [reset]);

  const handleCreate = (data) => {
    if (!data.addresses.length) {
      data.addresses = [];
    }
    if (!data.phoneNumbers.length) {
      data.phoneNumbers = [];
    }
    if (!data.emails.length) {
      data.emails = [];
    }
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : EMPTY_SUPPLIER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)} onKeyDown={preventSend}>
        <FieldsContainer>
          <TextControlled
            width="150px"
            name="id"
            label="Código"
            placeholder="Código (A1)"
            rules={RULES.REQUIRED_TWO_DIGIT}
            onChange={(e) => e.target.value.toUpperCase()}
            disabled={isUpdating}
            maxLength={2}
          />
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
          />
        </FieldsContainer>
        <ContactControlled />
        <TextAreaControlled name="comments" label="Comentarios" />
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : EMPTY_SUPPLIER)}
        />
      </Form>
    </FormProvider>
  )
};

export default SupplierForm;
