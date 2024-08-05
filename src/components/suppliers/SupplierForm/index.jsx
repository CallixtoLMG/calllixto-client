import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment } from "@/components/common/custom";
import { ContactFields, ControlledComments } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

const EMPTY_SUPPLIER = { id: '', name: '', emails: [], phoneNumbers: [], addresses: [], comments: '' };

const SupplierForm = ({ supplier, onSubmit, isUpdating, isLoading }) => {
  const methods = useForm({ defaultValues: supplier });

  const { handleSubmit, control, reset, formState: { errors, isDirty } } = methods;

  const handleReset = useCallback((supplier) => {
    reset(supplier);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : EMPTY_SUPPLIER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
        <FieldsContainer>
          <FormField>
            <RuledLabel title="Código" message={errors?.id?.message} required={!isUpdating} />
            {isUpdating ? (
              <Segment placeholder>{supplier?.id}</Segment>
            ) : (
              <Controller
                name="id"
                control={control}
                rules={RULES.REQUIRED_TWO_DIGIT}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Código (A1)"
                    disabled={isUpdating}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                )}
              />
            )}
          </FormField>
          <FormField width="40%">
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          </FormField>
        </FieldsContainer>
        <ContactFields />
        <FieldsContainer>
          <Label >Comentarios</Label>
          <ControlledComments control={control} />
        </FieldsContainer>
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
