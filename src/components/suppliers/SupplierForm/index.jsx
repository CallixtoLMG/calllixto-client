"use client";
import { PAGES, RULES } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { MaskedInput, PhoneContainer } from "./styles";
import { RuledLabel, Form, FieldsContainer, FormField, Input, Label, TextArea, Segment } from "@/components/common/custom";
import { SubmitAndRestore } from "@/components/common/buttons";
import { formatedPhone } from "@/utils";

const EMPTY_SUPPLIER = { id: '', name: '', email: '', phone: { areaCode: '', number: '' }, address: '', comments: '' };

const SupplierForm = ({ supplier, onSubmit, readonly }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm({ defaultValues: supplier });
  const isUpdating = useMemo(() => !!supplier?.id, [supplier]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((supplier) => {
    reset(supplier || EMPTY_SUPPLIER);
  }, [reset]);

  const handleForm = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.SUPPLIERS.BASE);
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
            <Segment>{supplier?.name}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField flex="none" width="200px">
        <RuledLabel title="Teléfono" message={errors?.phone?.areaCode?.message || errors?.phone?.number?.message} />
          {!readonly ? (
            <PhoneContainer>
              <Box width="70px">
                <Controller
                  name="phone.areaCode"
                  control={control}
                  rules={RULES.PHONE.AREA_CODE}
                  render={({ field }) =>
                    <MaskedInput
                      {...field}
                      mask="9999"
                      maskChar={null}
                      placeholder="Área"
                    />
                  }
                />
              </Box>
              <Box width="130px">
                <Controller
                  name="phone.number"
                  control={control}
                  rules={RULES.PHONE.NUMBER}
                  render={({ field }) =>
                    <MaskedInput
                      {...field}
                      mask="99999999"
                      maskChar={null}
                      placeholder="Número"
                    />}
                />
              </Box>
            </PhoneContainer>
          ) : (
            <Segment>{formatedPhone(supplier?.phone?.areaCode, supplier?.phone?.number)}</Segment>
          )}
        </FormField>
        <FormField flex="1">
          <RuledLabel title="Email" message={errors?.email?.message} />
          {!readonly ? (
            <Controller
              name="email"
              control={control}
              rules={RULES.EMAIL}
              render={({ field }) => <Input {...field} placeholder="Email" />}
            />
          ) : (
            <Segment>{supplier?.email}</Segment>
          )}
        </FormField>
        <FormField flex="1">
          <Label >Dirección</Label>
          {!readonly ? (
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Dirección" />}
            />
          ) : (
            <Segment>{supplier?.address}</Segment>
          )}
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
        onClick={() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : null)}
      />
    </Form>
  )
};

export default SupplierForm;
