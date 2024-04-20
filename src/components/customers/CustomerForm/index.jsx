"use client"
import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, FieldsContainer, Form, FormField, Icon, Input, Label, PhoneContainer, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";


const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };

const CustomerForm = ({ customer, onSubmit, isLoading, readonly }) => {
  console.log(customer);
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...customer,
      phoneNumbers: customer?.phoneNumbers.length ? customer.phoneNumbers : [{ areaCode: '', number: '', ref: "" }],
      addresses: customer?.addresses?.length ? customer.addresses : [{ address: '', ref: '' }],
    }
  });
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "phoneNumbers"
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: "addresses"
  });

  const isUpdating = useMemo(() => !!params.id, [params.id]);

  const handleReset = useCallback((customer) => {
    reset(customer || EMPTY_CUSTOMER);
  }, [reset]);

  const filterEmptyFields = data => {
    const filteredData = { ...data };

    // Filtra y limpia teléfonos
    if (filteredData.phoneNumbers) {
      filteredData.phoneNumbers = filteredData.phoneNumbers
        .map(phone => ({
          ...phone,
          areaCode: phone.areaCode.trim(),  // Asegura que no enviará espacios extra
          number: phone.number.trim(),
          ref: phone.ref?.trim()  // Uso de optional chaining por si ref no está definido
        }))
        .filter(phone => phone.areaCode && phone.number)  // Solo incluye teléfonos con código de área y número
        .map(phone => {
          if (!phone.ref) delete phone.ref;  // Elimina 'ref' si está vacío
          return phone;
        });
    }

    // Filtra y limpia direcciones
    if (filteredData.addresses) {
      filteredData.addresses = filteredData.addresses
        .map(address => ({
          ...address,
          address: address.address.trim(),
          ref: address.ref?.trim()
        }))
        .filter(address => address.address)  // Solo incluye direcciones con campo 'address' lleno
        .map(address => {
          if (!address.ref) delete address.ref;  // Elimina 'ref' si está vacío
          return address;
        });
    }

    return filteredData;
  };

  const handleCreate = (data) => {
    const cleanedData = filterEmptyFields(data);
    console.log(cleanedData)
    onSubmit(cleanedData);
  };

  return (
    <Form onSubmit={handleSubmit(handleCreate)}>
      <FieldsContainer>
        <FormField flex="2">
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
        <FormField flex="3">
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
      </FieldsContainer>
      {console.log(errors)}
      <FieldsContainer>
        {phoneFields.map((item, index) => (
          <FormField flex="none" width="200px" key={item.id}>
            <RuledLabel
            
              title={`Teléfono ${index + 1}`}
              message={errors?.phoneNumbers?.[index]?.areaCode || errors?.phoneNumbers?.[index]?.number}
              popupMsg="Borrar teléfono"
              dele={!readonly ? () => removePhone(index) : undefined}
              readonly={readonly}
            >
              {!readonly && (
                <Icon circular name="erase" color="red" size="small" onClick={() => removePhone(index)} />
              )}
            </RuledLabel>
            <PhoneContainer wrap>
              {!readonly ? (
                <Controller
                  name={`phoneNumbers[${index}]`}
                  control={control}
                  rules={{
                    validate: {
                      correctLength: (value) => (value.areaCode.length + value.number.length === 10) || "El número debe tener 10 caracteres"
                    }
                  }}
                  render={({ field: { value, onChange, ...props } }) => (
                    <>
                      <Input
                        width="100%"
                        placeholder="Referencia"
                        value={value.ref}
                        onChange={(e) => onChange({ ...value, ref: e.target.value })}
                      />
                      <CurrencyFormatInput
                        height="50px"
                        format="####"
                        width="35%"
                        placeholder="Área"
                        value={value.areaCode}
                        onChange={(e) => onChange({ ...value, areaCode: e.target.value })}
                      />
                      <CurrencyFormatInput
                        height="50px"
                        format="#######"
                        width="60%"
                        placeholder="Número"
                        value={value.number}
                        onChange={(e) => onChange({ ...value, number: e.target.value })}
                      />
                    </>
                  )}
                />
              ) : (
                <>
                  <Segment>{customer?.phoneNumbers[index].ref}</Segment>
                  <Segment width="35%">{customer?.phoneNumbers[index].areaCode}</Segment>
                  <Segment width="60%">{customer?.phoneNumbers[index].number}</Segment>
                </>
              )}
            </PhoneContainer>
          </FormField>
        ))}
        {!readonly && (
          <Popup
            size="mini"
            position="top center"
            content="Agregar Teléfono"
            trigger={<Icon circular name="add" color="green" size="small" onClick={() => appendPhone({ areaCode: '', number: '' })} />}
          />
        )}
      </FieldsContainer>
      <FieldsContainer>
        {addressFields.map((item, index) => (
          <FormField width="30%" key={item.id}>
            <RuledLabel
              popupMsg={"Borrar dirección"}
              dele={!readonly ? () => removeAddress(index) : undefined}
              title={`Dirección ${index + 1}`}>
              {!readonly && (
                <Icon circular name="erase" color="red" size="small" onClick={() => removeAddress(index)} />
              )}
            </RuledLabel>
            {!readonly ? (
              <Controller
                name={`addresses[${index}]`}
                control={control}
                render={({ field: { value, onChange, } }) => (
                  <>
                    <Input
                      placeholder="Refencia"
                      value={value.ref}
                      onChange={(e) => {
                        onChange({
                          ...value,
                          ref: e.target.value
                        })
                      }}
                    />
                    <Input
                      value={value.address}
                      placeholder="Dirección"
                      onChange={(e) => {
                        onChange({
                          ...value,
                          address: e.target.value
                        })
                      }} />
                  </>)}
              />
            ) : (
              <>
                <Segment>{customer?.addresses[index].ref}</Segment>
                <Segment>{customer?.addresses[index].address}</Segment>
              </>
            )}
          </FormField>))}
        {!readonly && (
          <Popup
            size="mini"
            position="top center"
            content="Agregar dirección"
            trigger={<Icon circular name="add" color="green" size="small" onClick={() => appendAddress({ address: '', ref: '' })} />}
          />
        )}
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
