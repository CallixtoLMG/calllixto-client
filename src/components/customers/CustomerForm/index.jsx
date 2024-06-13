"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { RULES } from "@/constants";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button, Icon, Popup } from "semantic-ui-react";
import { validateEmail, validatePhone } from "@/utils";

const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };
const EMPTY_PHONE = { ref: '', areaCode: '', number: '' };
const EMPTY_ADDRESS = { ref: '', address: '' };
const EMPTY_EMAIL = { ref: '', email: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });

  const [phoneToAdd, setPhoneToAdd] = useState(EMPTY_PHONE);
  const [addressToAdd, setAddressToAdd] = useState(EMPTY_ADDRESS);
  const [emailToAdd, setEmailToAdd] = useState(EMPTY_EMAIL);
  const [error, setError] = useState();

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

  const updateFieldToAdd = (setter, field, value) => {
    if ((field === 'areaCode' || field === 'number') && !/^\d*$/.test(value)) {
      return;
    }
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhone = () => {
    if (!validatePhone(phoneToAdd)) {
      setError({ phone: 'El área y el número deben sumar 10 dígitos.' });
      return;
    }
    appendPhone(phoneToAdd);
    setPhoneToAdd(EMPTY_PHONE);
    setError();
  };

  const handleAddAddress = () => {
    if (!addressToAdd.address) {
      setError({ address: 'La dirección es requerida.' });
      return;
    }
    appendAddress(addressToAdd);
    setAddressToAdd(EMPTY_ADDRESS);
  };

  const handleAddEmail = () => {
    if (!validateEmail(emailToAdd.email)) {
      setError({ email: 'El correo electrónico no es válido.' });
      return;
    }
    appendEmail(emailToAdd);
    setEmailToAdd(EMPTY_EMAIL);
    setError();
  };

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
              <Button type="button" color="green"><Icon name="add" /> Teléfono</Button>
            }
            on='click'
            onClose={() => {
              setPhoneToAdd(EMPTY_PHONE);
              setError();
            }}
            position='top left'>
            <FieldsContainer width="60vw" alignItems="center" rowGap="5px">
              <FormField flex="1">
                <Label>Referencia</Label>
                <Input
                  placeholder="Referencia"
                  height="35px"
                  value={phoneToAdd.ref}
                  onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'ref', e.target.value)}
                />
              </FormField>
              <FormField flex="1">
                <RuledLabel title="Área" message={error?.phone} required />
                <Input
                  maxLength="4"
                  placeholder="Área"
                  height="35px"
                  value={phoneToAdd.areaCode}
                  onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'areaCode', e.target.value)}
                />
              </FormField>
              <FormField flex="1">
                <RuledLabel title="Número" message={error?.phone} required />
                <Input
                  maxLength="7"
                  placeholder="Número"
                  height="35px"
                  value={phoneToAdd.number}
                  onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'number', e.target.value)}
                />
              </FormField>
              <Button color="green" onClick={handleAddPhone}>
                <Icon name="add" />Agregar
              </Button>
            </FieldsContainer>
          </Popup>
          <Table
            headers={[
              { id: 1, title: 'Referencia', align: "left", value: (phone) => phone.ref },
              { id: 2, title: 'Área', align: "left", value: (phone) => phone.areaCode },
              { id: 3, title: 'Número', align: "left", value: (phone) => phone.number }
            ]}
            actions={!readonly ? [
              { id: 1, icon: 'trash', color: 'red', onClick: (phone, index) => removePhone(index), tooltip: 'Eliminar' }
            ] : []}
            elements={phoneFields}
          />
        </FormField>
        <FormField flex="1" style={{ position: 'relative' }}>
          <Popup
            trigger={
              <Button type="button" color="green"><Icon name="add" /> Dirección</Button>
            }
            on='click'
            onClose={() => {
              setAddressToAdd(EMPTY_ADDRESS);
            }}
            position='top left'>
            <FieldsContainer width="45vw" alignItems="center">
              <FormField flex="1">
                <Label>Referencia</Label>
                <Input
                  placeholder="Referencia"
                  height="35px"
                  value={addressToAdd.ref}
                  onChange={(e) => updateFieldToAdd(setAddressToAdd, 'ref', e.target.value)}
                />
              </FormField>
              <FormField flex="2">
                <RuledLabel title="Dirección" message={error?.address} required />
                <Input
                  placeholder="Dirección"
                  height="35px"
                  value={addressToAdd.address}
                  onChange={(e) => updateFieldToAdd(setAddressToAdd, 'address', e.target.value)}
                />
              </FormField>
              <Button color="green" onClick={handleAddAddress}>
                <Icon name="add" />Agregar
              </Button>
            </FieldsContainer>
          </Popup>
          <Table
            headers={[
              { id: 1, title: 'Referencia', align: "left", value: (address) => address.ref },
              { id: 2, title: 'Dirección', align: "left", value: (address) => address.address }
            ]}
            actions={!readonly ? [
              { id: 1, icon: 'trash', color: 'red', onClick: (address, index) => removeAddress(index), tooltip: 'Eliminar' }
            ] : []}
            elements={addressFields}
          />
        </FormField>
        <FormField flex="1" style={{ position: 'relative' }}>
          <Popup
            trigger={
              <Button type="button" color="green"><Icon name="add" /> Email</Button>
            }
            on='click'
            onClose={() => {
              setEmailToAdd(EMPTY_EMAIL);
            }}
            position='top left'>
            <FieldsContainer width="50vw" alignItems="center">
              <FormField flex="1">
                <Label>Referencia</Label>
                <Input
                  placeholder="Referencia"
                  height="35px"
                  value={emailToAdd.ref}
                  onChange={(e) => updateFieldToAdd(setEmailToAdd, 'ref', e.target.value)}
                />
              </FormField>
              <FormField flex="2">
                <RuledLabel title="Email" message={error?.email} required />
                <Input
                  placeholder="Email"
                  height="35px"
                  value={emailToAdd.email}
                  onChange={(e) => updateFieldToAdd(setEmailToAdd, 'email', e.target.value)}
                />
              </FormField>
              <Button color="green" onClick={handleAddEmail}>
                <Icon name="add" />Agregar
              </Button>
            </FieldsContainer>
          </Popup>
          <Table
            headers={[
              { id: 1, title: 'Referencia', align: "left", value: (email) => email.ref },
              { id: 2, title: 'Email', align: "left", value: (email) => email.email }
            ]}
            actions={!readonly ? [
              { id: 1, icon: 'trash', color: 'red', onClick: (email, index) => removeEmail(index), tooltip: 'Eliminar' }
            ] : []}
            elements={emailsFields}
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
        onReset={() => handleReset(isUpdating ? { ...EMPTY_CUSTOMER, ...customer } : null)}
      />
    </Form>
  );
};

export default CustomerForm;
