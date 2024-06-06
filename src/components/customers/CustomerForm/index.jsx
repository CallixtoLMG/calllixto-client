"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { RULES } from "@/constants";
import _ from 'lodash';
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button, Icon, Popup } from "semantic-ui-react";

const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const [phoneToAdd, setPhoneToAdd] = useState({ ref: '', areaCode: '', number: '' });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "phoneNumbers"
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: "addresses"
  });

  const { fields: emailsFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control,
    name: "emails"
  });

  const isUpdating = useMemo(() => !!params.id, [params.id]);

  const handleReset = useCallback((customer) => {
    reset(customer || EMPTY_CUSTOMER);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  const updatePhoneToAdd = useCallback((field, value) => {
    setPhoneToAdd({ ...phoneToAdd, [field]: value });
  }, [phoneToAdd]);

  return (
    <Form onSubmit={handleSubmit(handleCreate)}>
      <FieldsContainer>
        <FormField width="33%">
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
      <FieldsContainer columnGap="50px">
        <FormField width="33%" style={{ position: 'relative' }}>
          <Popup
            trigger={
              <Button
                type="button"
                color="green"
                icon="add"
              />
            }
            on='click'
            position='top left'>
            <FieldsContainer width="800px" alignItems="center">
              <FormField flex="1">
                <Label>Referencia</Label>
                <Input
                  placeholder="Referencia"
                  height="35px"
                  value={phoneToAdd.ref}
                  onChange={(e) => updatePhoneToAdd('ref', e.target.value)}
                />
              </FormField>
              <FormField flex="1">
                <Label>Área</Label>
                <Input
                  placeholder="Área"
                  height="35px"
                  value={phoneToAdd.areaCode}
                  onChange={(e) => updatePhoneToAdd('areaCode', e.target.value)}
                />
              </FormField>
              <FormField flex="1">
                <Label>Número</Label>
                <Input
                  placeholder="Número"
                  height="35px"
                  value={phoneToAdd.number}
                  onChange={(e) => updatePhoneToAdd('number', e.target.value)}
                />
              </FormField>
              <Button color="green" onClick={() => appendPhone(phoneToAdd)}>
                <Icon name="add" />Agregar
              </Button>
            </FieldsContainer>
          </Popup>
          <Table
            headers={[
              {
                id: 1,
                title: 'Referencia',
                align: "left",
                value: (phone) => phone.ref
              },
              {
                id: 2,
                title: 'Área',
                align: "left",
                value: (phone) => phone.areaCode
              },
              {
                id: 3,
                title: 'Número',
                align: "left",
                value: (phone) => phone.number
              },
            ]}
            actions={!readonly ? [
              {
                id: 1,
                icon: 'trash',
                color: 'red',
                onClick: (phone, index) => { removePhone(index); },
                tooltip: 'Eliminar'
              }
            ] : []}
            elements={phoneFields}
          />
        </FormField>
        <FormField flex="1" style={{ position: 'relative' }}>
          <Table
            headers={[
              {
                id: 1,
                title: 'Referencia',
                align: "left",
                value: (address) => address.ref
              },
              {
                id: 2,
                title: 'Dirección',
                align: "left",
                value: (address) => address.address
              },
            ]}
            actions={!readonly ? [
              {
                id: 1,
                icon: 'trash',
                color: 'red',
                onClick: (address, index) => { removeAddress(index); },
                tooltip: 'Eliminar'
              }
            ] : []}
            elements={addressFields}
          />
          <Button
            onClick={() => {}}
            type="button"
            color="green"
            icon="add"
            style={{ position: 'absolute', top: '10px', left: '-45px' }}
          />
        </FormField>
        <FormField flex="1" style={{ position: 'relative' }}>
          <Table
            headers={[
              {
                id: 1,
                title: 'Referencia',
                align: "left",
                value: (email) => email.ref
              },
              {
                id: 2,
                title: 'Email',
                align: "left",
                value: (email) => email.email
              },
            ]}
            actions={!readonly ? [
              {
                id: 1,
                icon: 'trash',
                color: 'red',
                onClick: (email, index) => { removeEmail(index); },
                tooltip: 'Eliminar'
              }
            ] : []}
            elements={emailsFields}
          />
          <Button
            onClick={() => {}}
            type="button"
            color="green"
            icon="add"
            style={{ position: 'absolute', top: '10px', left: '-45px' }}
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
