import { formatedSimplePhone, validateEmail, validatePhone } from "@/common/utils";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Form, Popup } from "semantic-ui-react";
import { COLORS, ICONS } from "@/common/constants";
import { IconedButton } from "../../buttons";
import { Box, FieldsContainer, Flex, FormField, Input } from '../../custom';
import { Table } from '../../table';
import { ADDRESS_TABLE_HEADERS, EMAIL_TABLE_HEADERS, PHONE_TABLE_HEADERS } from "../form.constants";

const EMPTY_PHONE = { ref: '', areaCode: '', number: '' };
const EMPTY_ADDRESS = { ref: '', address: '' };
const EMPTY_EMAIL = { ref: '', email: '' };

export const ContactControlled = () => {
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
      setError({ address: 'Campo requerido.' });
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
      <Flex flex="1" flexDirection="column">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconedButton
                text="Teléfono"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
              />
            </Box>
          }
          on='click'
          onClose={() => {
            setPhoneToAdd(EMPTY_PHONE);
            setError();
          }}
          position='top left'>
          <Form>
            <FieldsContainer width="60vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={phoneToAdd.ref}
                onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'ref', e.target.value)}
              />
              <FormField
                flex="1"
                label="Área"
                control={Input}
                error={error?.phone ? {
                  content: error.phone,
                  pointing: 'above',
                } : null}
                required
                maxLength="4"
                placeholder="Área"
                value={phoneToAdd.areaCode}
                onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'areaCode', e.target.value)}
              />
              <FormField
                flex="1"
                label="Número"
                control={Input}
                error={error?.phone ? {
                  content: error.phone,
                  pointing: 'above',
                } : null}
                required
                maxLength="7"
                placeholder="Número"
                value={phoneToAdd.number}
                onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'number', e.target.value)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddPhone}
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box marginTop="8px" />
        <Table
          headers={PHONE_TABLE_HEADERS}
          actions={[
            { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (phone, index) => removePhone(index), tooltip: 'Eliminar' }
          ]}
          elements={phoneFields}
        />
      </Flex>
      <Flex flex="1" flexDirection="column">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconedButton
                text="Dirección"
                icon={ICONS.ADD}
                type="button"
                color={COLORS.GREEN}
              />
            </Box>
          }
          on='click'
          onClose={() => {
            setAddressToAdd(EMPTY_ADDRESS);
          }}
          position='top left'>
          <Form>
            <FieldsContainer width="45vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={addressToAdd.ref}
                onChange={(e) => updateFieldToAdd(setAddressToAdd, 'ref', e.target.value)}
              />
              <FormField
                flex="2"
                label="Dirección"
                control={Input}
                error={error?.address ? {
                  content: error.address,
                  pointing: 'above',
                } : null}
                required
                placeholder="Dirección"
                value={addressToAdd.address}
                onChange={(e) => updateFieldToAdd(setAddressToAdd, 'address', e.target.value)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddAddress}
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box marginTop="8px" />
        <Table
          $wrap
          headers={ADDRESS_TABLE_HEADERS}
          actions={[
            { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (address, index) => removeAddress(index), tooltip: 'Eliminar' }
          ]}
          elements={addressFields}
        />
      </Flex>
      <Flex flex="1" flexDirection="column">
        <Popup
          trigger={
            <Box width="fit-content">
              <IconedButton
                text="Email"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
              />
            </Box>
          }
          on='click'
          onClose={() => {
            setEmailToAdd(EMPTY_EMAIL);
          }}
          position='top left'>
          <Form>
            <FieldsContainer width="50vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={emailToAdd.ref}
                onChange={(e) => updateFieldToAdd(setEmailToAdd, 'ref', e.target.value)}
              />
              <FormField
                flex="2"
                label="Email"
                control={Input}
                error={error?.email ? {
                  content: error.email,
                  pointing: 'above',
                } : null}
                required
                placeholder="Email"
                value={emailToAdd.email}
                onChange={(e) => updateFieldToAdd(setEmailToAdd, 'email', e.target.value)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddEmail}
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box marginTop="8px" />
        <Table
          $wrap={true}
          headers={EMAIL_TABLE_HEADERS}
          actions={[
            { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (email, index) => removeEmail(index), tooltip: 'Eliminar' }
          ]}
          elements={emailsFields}
        />
      </Flex>
    </FieldsContainer>
  )
}