import { formatedSimplePhone, validateEmail, validatePhone } from "@/utils";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { Box, FieldsContainer, FormField, Input, Label, RuledLabel } from '../custom';
import { Table } from '../table';
import { ADDRESS_TABLE_HEADERS, EMAIL_TABLE_HEADERS, PHONE_TABLE_HEADERS } from "./form.common";
import { IconnedButton } from "../buttons";


const EMPTY_PHONE = { ref: '', areaCode: '', number: '' };
const EMPTY_ADDRESS = { ref: '', address: '' };
const EMPTY_EMAIL = { ref: '', email: '' };

export const ContactFields = () => {
  const [error, setError] = useState();
  const [phoneToAdd, setPhoneToAdd] = useState(EMPTY_PHONE);
  const [addressToAdd, setAddressToAdd] = useState(EMPTY_ADDRESS);
  const [emailToAdd, setEmailToAdd] = useState(EMPTY_EMAIL);
  const { control } = useFormContext();

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
    const phoneExists = phoneFields.some(phone => formatedSimplePhone(phone) === formatedSimplePhone(phoneToAdd));
    if (phoneExists) {
      setError({ phone: 'El teléfono ya existe.' });
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
    const addressExists = addressFields.some(
      (address) => address.address === addressToAdd.address
    );
    if (addressExists) {
      setError({ address: 'La dirección ya existe.' });
      return;
    }
    appendAddress(addressToAdd);
    setAddressToAdd(EMPTY_ADDRESS);
    setError();
  };

  const handleAddEmail = () => {
    if (!validateEmail(emailToAdd.email)) {
      setError({ email: 'El correo electrónico no es válido.' });
      return;
    }
    const emailExists = emailsFields.some(
      (email) => email.email === emailToAdd.email
    );
    if (emailExists) {
      setError({ email: 'El correo electrónico ya existe.' });
      return;
    }
    appendEmail(emailToAdd);
    setEmailToAdd(EMPTY_EMAIL);
    setError();
  };

  return (
    <FieldsContainer columnGap="50px">
      <FormField width="33%">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconnedButton
                text="Teléfono"
                icon="add"
                color="green"
              />
            </Box>
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
            <IconnedButton
              text="Agregar"
              icon="add"
              color="green"
              onClick={handleAddPhone}
            />
          </FieldsContainer>
        </Popup>
        <Table
          headers={PHONE_TABLE_HEADERS}
          actions={[
            { id: 1, icon: 'trash', color: 'red', onClick: (phone, index) => removePhone(index), tooltip: 'Eliminar' }
          ]}
          elements={phoneFields}
        />
      </FormField>
      <FormField flex="1">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconnedButton
                text="Dirección"
                icon="add"
                type="button"
                color="green"
              />
            </Box>
          }
          on='click'
          onClose={() => {
            setAddressToAdd(EMPTY_ADDRESS);
          }}
          position='top left'>
          <FieldsContainer width="45vw" alignItems="center" rowGap="5px">
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
            <IconnedButton
              text="Agregar"
              icon="add"
              color="green"
              onClick={handleAddAddress}
            />
          </FieldsContainer>
        </Popup>
        <Table
          $wrap
          headers={ADDRESS_TABLE_HEADERS}
          actions={[
            { id: 1, icon: 'trash', color: 'red', onClick: (address, index) => removeAddress(index), tooltip: 'Eliminar' }
          ]}
          elements={addressFields}
        />
      </FormField>
      <FormField flex="1">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconnedButton
                text="Email"
                icon="add"
                color="green"
              />
            </Box>
          }
          on='click'
          onClose={() => {
            setEmailToAdd(EMPTY_EMAIL);
          }}
          position='top left'>
          <FieldsContainer width="50vw" alignItems="center" rowGap="5px">
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
            <IconnedButton
              text="Agregar"
              icon="add"
              color="green"
              onClick={handleAddEmail}
            />
          </FieldsContainer>
        </Popup>
        <Table
          $wrap={true}
          headers={EMAIL_TABLE_HEADERS}
          actions={[
            { id: 1, icon: 'trash', color: 'red', onClick: (email, index) => removeEmail(index), tooltip: 'Eliminar' }
          ]}
          elements={emailsFields}
        />
      </FormField>
    </FieldsContainer>
  )
}