"use client"
import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Icon, Input, Label, PhoneContainer, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };

const CustomerForm = ({ customer, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...customer,
      phoneNumbers: customer?.phoneNumbers.length ? customer.phoneNumbers : [{ areaCode: '', number: '' }]
    }
  });
  console.log(errors)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "phoneNumbers"
  });

  const isUpdating = useMemo(() => !!params.id, [params.id]);

  const handleReset = useCallback((customer) => {
    reset(customer || EMPTY_CUSTOMER);
  }, [reset]);

  const handleCreate = (data) => {
    console.log(data)
    // onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(handleCreate)}>
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
        {fields.map((item, index) => (
          <FormField flex="none" width="200px" key={item.id}>
            <RuledLabel dele title={`Teléfono ${index + 1}`} message={errors?.phoneNumbers?.find(n => n.type === `hola${index}`)?.message} >
              hola
              {!readonly && (
                <Icon circular name="erase" color="red" size="small" onClick={() => remove(index)} />
              )}
            </RuledLabel>
            <PhoneContainer>
              <Controller
                name={`phoneNumbers[${index}]`}
                control={control}
                rules={{ validate: { [`hola${index}`]: (value) => value.areaCode.length + value.number.length === 10 || "numero debe tener 10 caracteres" } }}
                render={({ field: { value, onChange, ...props } }) => (
                  <>
                    <Input
                      width="35%"
                      {...props}
                      mask="9999"
                      maskChar={null}
                      placeholder="Área"
                      value={value.areaCode}
                      onChange={(e) => {
                        onChange({
                          ...value,
                          areaCode: e.target.value
                        })
                      }}
                    />
                    <Input
                      width="65%"
                      {...props}
                      mask="9999999"
                      maskChar={null}
                      placeholder="Número"
                      value={value.number}
                      onChange={(e) => {
                        onChange({
                          ...value,
                          number: e.target.value
                        })
                      }}
                    />
                  </>
                )}
              />
            </PhoneContainer>

          </FormField>
        ))}
        {!readonly && (
          <Icon circular name="add" color="green" size="small" onClick={() => append({ areaCode: '', number: '' })} />
        )}
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
              name="addresses"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Dirección" />}
            />
          ) : (
            <Segment>{customer?.addresses}</Segment>
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
