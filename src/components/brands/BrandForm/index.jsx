import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { preventSend } from "@/utils";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_BRAND = { name: '', id: '', comments: '' };

const BrandForm = ({ brand, onSubmit, isLoading, isUpdating }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({ defaultValues: brand });

  const handleReset = useCallback((brand) => {
    reset(brand);
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
                placeholder="Código (A1)"
                {...field}
                disabled={isUpdating}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                maxLength={2}
              />
            )}
          />
        </FormField>
        <FormField width="50%">
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
        <Label>Comentarios</Label>
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
        onReset={() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : EMPTY_BRAND)}
      />
    </Form>
  )
};

export default BrandForm;
