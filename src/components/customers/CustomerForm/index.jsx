"use client"
import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, MaskedInput, PhoneContainer, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { formatedPhone } from "@/utils";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";

const EMPTY_CUSTOMER = { name: '', email: '', phone: { areaCode: '', number: '' }, address: '', comments: '' };

const CustomerForm = ({ customer, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({ defaultValues: customer });
  const isUpdating = useMemo(() => !!params.id, [params.id]);

  const handleReset = useCallback((customer) => {
    reset(customer || EMPTY_CUSTOMER);
  }, [reset]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FieldsContainer>
        <FormField width="50% !important">
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          {!readonly ? (
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          ) : (
            <Segment>{customer?.name}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField flex="none" width="200px">
          <Label>Teléfono</Label>
          {!readonly ? (
            <PhoneContainer>
              <Box width="70px">
                <Controller
                  name="phone.areaCode"
                  control={control}
                  rules={RULES.PHONE.AREA_CODE}
                  render={({ field }) =>
                    <MaskedInput
                      mask="9999"
                      maskChar={null}
                      {...field}
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
                      mask="99999999"
                      maskChar={null}
                      {...field}
                      placeholder="Número"
                    />}
                />
              </Box>
            </PhoneContainer>
          ) : (
            <Segment>{formatedPhone(customer?.phone?.areaCode, customer?.phone?.number)}</Segment>
          )}
        </FormField>
        <FormField flex="1">
          <RuledLabel title="Email" message={errors?.email?.message} />
          {!readonly ? (
            <Controller
              name="email"
              control={control}
              rules={RULES.EMAIL}
              render={({ field }) => <Input {...field} placeholder="nombre@mail.com" />}
            />
          ) : (
            <Segment>{customer?.email}</Segment>
          )}
        </FormField>
        <FormField flex="1">
          <Label>Dirección</Label>
          {!readonly ? (
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Dirección" />}
            />
          ) : (
            <Segment>{customer?.address}</Segment>
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
        onClick={() => handleReset(isUpdating ? { ...EMPTY_CUSTOMER, ...customer } : null)}
      />
    </Form>
  )
};

export default CustomerForm;
