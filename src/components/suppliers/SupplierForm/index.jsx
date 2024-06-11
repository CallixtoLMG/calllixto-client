"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, FieldsContainer, Form, FormField, Input, Label, PhoneContainer, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { formatedSimplePhone, preventSend } from "@/utils";
import { useCallback, useMemo, } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const EMPTY_SUPPLIER = { id: '', name: '', email: '', phoneNumbers: [{ areaCode: '', number: '' }], addresses: [{ address: '' }], comments: '' };

const SupplierForm = ({ supplier, onSubmit, readonly, isLoading }) => {
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      ...supplier,
      phoneNumbers: supplier?.phoneNumbers?.length ? supplier.phoneNumbers : [{ areaCode: '', number: '', }],
      addresses: supplier?.addresses?.length ? supplier.addresses : [{ address: '' }],
    }
  });

  const { fields: phoneFields, } = useFieldArray({
    control,
    name: "phoneNumbers"
  });

  const { fields: addressFields, } = useFieldArray({
    control,
    name: "addresses"
  });

  const isUpdating = useMemo(() => !!supplier?.id, [supplier]);

  const handleReset = useCallback((supplier) => {
    reset(supplier || EMPTY_SUPPLIER);
  }, [reset]);

  return (
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
      <FieldsContainer>
        {phoneFields.map((item, index) => (
          <FormField flex="none" width="200px" key={item.id}>
            <RuledLabel title="Teléfono" message={errors?.phone?.areaCode?.message || errors?.phone?.number?.message} />
            {!readonly ? (
              <PhoneContainer>
                <Controller
                  name={`phoneNumbers[${index}]`}
                  control={control}
                  rules={{
                    validate: {
                      correctLength: (value) => {
                        if (value.areaCode || value.number) {
                          const areaCode = value.areaCode.replace(/[^0-9]/g, '');
                          const number = value.number.replace(/[^0-9]/g, '');
                          return (areaCode.length + number.length === 10) || "El número debe tener 10 caracteres";
                        }
                        return true;
                      }
                    }
                  }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <CurrencyFormatInput
                        marginTop="5px"
                        shadow
                        height="50px"
                        format="####"
                        width="35%"
                        placeholder="Área"
                        value={value.areaCode}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                          onChange({
                            ...value,
                            areaCode: formattedValue
                          });
                        }}
                      />
                      <CurrencyFormatInput
                        marginTop="5px"
                        shadow
                        height="50px"
                        format="#######"
                        width="60%"
                        placeholder="Número"
                        value={value.number}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                          onChange({
                            ...value,
                            number: formattedValue
                          });
                        }}
                      />
                    </>
                  )}
                />
              </PhoneContainer>
            ) : (
              supplier.phoneNumbers ?
                <Segment>{formatedSimplePhone(supplier?.phoneNumbers[0])}</Segment>
                : <Segment></Segment>
            )}
          </FormField>
        ))}
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
        {addressFields.map((item, index) => (
          <FormField width="30%" key={item.id}>
            <Label >Dirección</Label>
            {!readonly ? (
              <Controller
                name={`addresses[${index}]`}
                control={control}
                render={({ field: { value, onChange, } }) => (
                  <Input
                    value={value.address}
                    placeholder="Dirección"
                    onChange={(e) => {
                      onChange({
                        ...value,
                        address: e.target.value
                      })
                    }} />
                )}
              />
            ) : (
              supplier.addresses ?
                <Segment>{supplier?.addresses[0]?.address}</Segment>
                : <Segment></Segment>
            )}
          </FormField>
        ))}
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
            />
          )}
        />
      </FieldsContainer>
      <SubmitAndRestore
        show={!readonly}
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_SUPPLIER, ...supplier } : null)}
      />
    </Form >
  )
};

export default SupplierForm;
