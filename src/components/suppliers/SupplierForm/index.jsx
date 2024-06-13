"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { preventSend } from "@/utils";
import { useCallback, } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_SUPPLIER = { id: '', name: '', emails: [], phoneNumbers: [], addresses: [], comments: '' };

const SupplierForm = ({ supplier, onSubmit, isUpdating, isLoading }) => {
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      ...supplier,
    }
  });

  const handleReset = useCallback((supplier) => {
    reset(supplier || EMPTY_SUPPLIER);
  }, [reset]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
      <FieldsContainer>
        <FormField>
          <RuledLabel title="Código" message={errors?.id?.message} required />
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
            />
          )}
        />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : null)}
      />
    </Form >
  )
};

export default SupplierForm;
