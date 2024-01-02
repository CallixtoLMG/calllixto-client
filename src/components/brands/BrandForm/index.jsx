"use client";
import { PAGES, RULES } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, FieldsContainer, FormField, Input, Label, RuledLabel, TextArea, Segment } from "@/components/common/custom";
import { SubmitAndRestore } from "@/components/common/buttons";

const EMPTY_BRAND = { name: '', id: '', comments: '' };

const BrandForm = ({ brand, onSubmit, readonly }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({ defaultValues: brand });
  const isUpdating = useMemo(() => !!brand?.id, [brand]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((brand) => {
    reset(brand || EMPTY_BRAND);
  }, [reset]);

  const handleForm = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.BRANDS.BASE);
    }, 2000);
  };

  return (
    <Form onSubmit={handleSubmit(handleForm)}>
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
                  placeholder="Código (A1)"
                  {...field}
                  disabled={isUpdating}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              )}
            />
          ) : (
            <Segment>{brand?.id}</Segment>
          )}
        </FormField>
        <FormField width="50%">
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          {!readonly ? (
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          ) : (
            <Segment>{brand?.name}</Segment>
          )}
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
              disabled={readonly}
              readonly
            />
          )}
        />
      </FieldsContainer>
      <SubmitAndRestore
        show={!readonly}
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : null)}
      />
    </Form>
  )
};

export default BrandForm;
