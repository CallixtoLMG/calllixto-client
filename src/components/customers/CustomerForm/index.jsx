"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, FieldsContainer, Form, FormField, Input, Label, PhoneContainer, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import _ from 'lodash';
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { Icon } from "./styles";

const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
      phoneNumbers: customer?.phoneNumbers?.length ? customer.phoneNumbers : [{ areaCode: '', number: '', ref: "" }],
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

  const trimStringFields = obj => {
    return _.mapValues(obj, value => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (Array.isArray(value)) {
        return value.map(trimStringFields);
      }
      if (_.isObject(value) && !_.isEmpty(value)) {
        return trimStringFields(value);
      }
      return value;
    });
  };
  
  const filterEmptyFields = data => {
    const cleanedData = trimStringFields(data);
  
    const removeEmpty = obj => {
      return _.omitBy(obj, value =>
        _.isUndefined(value) || (_.isString(value) && value === '') ||
        (_.isArray(value) && value.length === 0) ||
        (_.isObject(value) && _.isEmpty(value))
      );
    };
  
    let filteredData = removeEmpty(cleanedData);
  
    // Ensure phoneNumbers and addresses are always arrays
    if (!filteredData.phoneNumbers) {
      filteredData.phoneNumbers = [];
    }
  
    if (!filteredData.addresses) {
      filteredData.addresses = [];
    }
  
    if (filteredData.phoneNumbers.length > 0) {
      filteredData.phoneNumbers = filteredData.phoneNumbers
        .filter(phone => phone.areaCode && phone.number);
    }
  
    if (filteredData.addresses.length > 0) {
      filteredData.addresses = filteredData.addresses
        .map(address => removeEmpty(address))
        .filter(address => address.address);
    }
  
    if (!filteredData.phoneNumbers) {
      filteredData.phoneNumbers = [];
    }
  
    if (!filteredData.addresses) {
      filteredData.addresses = [];
    }
  
    return filteredData;
  };

  const handleCreate = (data) => {
    const cleanedData = filterEmptyFields(data);
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
      <FieldsContainer rowGap="20px">
        {phoneFields.map((item, index) => (
          <FormField flex="none" width="200px" key={item.id}>
            <RuledLabel
              title={`Teléfono ${index + 1}`}
              message={errors?.phoneNumbers?.[index]?.message}
              popupMsg="Borrar teléfono"
              onDelete={!readonly ? () => removePhone(index) : undefined}
              readonly={readonly}
            >
            </RuledLabel>
            <PhoneContainer wrap>
              {!readonly ? (
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
                      <Input
                        width="100%"
                        placeholder="Referencia"
                        value={value.ref || ''}
                        onChange={(e) => {
                          onChange({
                            ...value,
                            ref: e.target.value
                          })
                        }}
                      />
                      <CurrencyFormatInput
                        shadow
                        height="50px"
                        format="####"
                        width="35%"
                        placeholder="Área"
                        value={value.areaCode || ''}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(/[^0-9]/g, '');
                          onChange({
                            ...value,
                            areaCode: formattedValue
                          });
                        }}
                      />
                      <CurrencyFormatInput
                        shadow
                        height="50px"
                        format="#######"
                        width="60%"
                        placeholder="Número"
                        value={value.number || ''}
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
              ) : (
                <>
                  <Segment>{customer?.phoneNumbers[index]?.ref}</Segment>
                  <Segment width="35%">{customer?.phoneNumbers[index]?.areaCode}</Segment>
                  <Segment width="60%">{customer?.phoneNumbers[index]?.number}</Segment>
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
            trigger={<Icon circular name="add" color="green" size="small" onClick={() => appendPhone({ areaCode: '', number: '', ref: '' })} />}
          />
        )}
      </FieldsContainer>
      <FieldsContainer rowGap="20px">
        {addressFields.map((item, index) => (
          <FormField width="30%" key={item.id}>
            <RuledLabel
              popupMsg={"Borrar dirección"}
              onDelete={!readonly ? () => removeAddress(index) : undefined}
              title={`Dirección ${index + 1}`}>
            </RuledLabel>
            {!readonly ? (
              <Controller
                name={`addresses[${index}]`}
                control={control}
                render={({ field: { value, onChange, } }) => (
                  <>
                    <Input
                      placeholder="Referencia"
                      value={value.ref || ''}
                      onChange={(e) => {
                        onChange({
                          ...value,
                          ref: e.target.value
                        })
                      }}
                    />
                    <Input
                      value={value.address || ''}
                      placeholder="Dirección"
                      onChange={(e) => {
                        onChange({
                          ...value,
                          address: e.target.value
                        })
                      }}
                    />
                  </>
                )}
              />
            ) : (
              <>
                <Segment>{customer?.addresses[index]?.ref}</Segment>
                <Segment>{customer?.addresses[index]?.address}</Segment>
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
              value={field.value || ''}
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
