import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { ContactFields } from "@/components/common/form";
import { RULES } from "@/constants";
import { preventSend } from "@/utils";
import { useCallback, useMemo, } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

const EMPTY_SUPPLIER = { id: '', name: '', email: '', phoneNumbers: [{ areaCode: '', number: '' }], addresses: [{ address: '' }], comments: '' };

const SupplierForm = ({ supplier, onSubmit, readonly, isLoading }) => {
  const methods = useForm({
    defaultValues: {
      ...supplier,
      phoneNumbers: supplier?.phoneNumbers?.length ? supplier.phoneNumbers : [{ areaCode: '', number: '', }],
      addresses: supplier?.addresses?.length ? supplier.addresses : [{ address: '' }],
    }
  });
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = methods;

  const isUpdating = useMemo(() => !!supplier?.id, [supplier]);

  const handleReset = useCallback((supplier) => {
    reset(supplier || EMPTY_SUPPLIER);
  }, [reset]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
        <FieldsContainer>
          <FormField>
            <RuledLabel title="Código" message={errors?.id?.message} required />
            {!readonly ? (
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
            ) : (
              <Segment>{supplier?.id}</Segment>
            )}
          </FormField>
          <FormField width="40%">
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            {!readonly ? (
              <Controller
                name="name"
                control={control}
                rules={RULES.REQUIRED}
                render={({ field }) => <Input {...field} placeholder="Nombre" />}
              />
            ) : (
              <Segment>{supplier?.name}</Segment>
            )}
          </FormField>
        </FieldsContainer>
        <ContactFields readonly={readonly} />
        <FieldsContainer>
          <Label >Comentarios</Label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                maxLength="2000"
                placeholder="Comentarios"
                disabled={readonly}
              />
            )}
          />
        </FieldsContainer>
        <SubmitAndRestore
          show={!readonly}
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onClick={() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : null)}
        />
      </Form>
    </FormProvider>
  )
};

export default SupplierForm;
