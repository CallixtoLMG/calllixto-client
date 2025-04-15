import { COLORS, ICONS } from "@/common/constants";
import { getFormatedPhone, handleEnterKeyDown, handleEscapeKeyDown, validateEmail, validatePhone } from "@/common/utils";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Form, Popup } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { Box, FieldsContainer, Flex, FormField, Input } from '../../custom';
import { Table } from '../../table';
import { ADDRESS_TABLE_HEADERS, EMAIL_TABLE_HEADERS, PHONE_TABLE_HEADERS } from "../form.constants";

const EMPTY_PHONE = { ref: '', areaCode: '', number: '' };
const EMPTY_ADDRESS = { ref: '', address: '' };
const EMPTY_EMAIL = { ref: '', email: '' };

export const ContactControlled = () => {
  const [error, setError] = useState();
  const [openPhone, setOpenPhone] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const [phoneToAdd, setPhoneToAdd] = useState(EMPTY_PHONE);
  const [addressToAdd, setAddressToAdd] = useState(EMPTY_ADDRESS);
  const [emailToAdd, setEmailToAdd] = useState(EMPTY_EMAIL);
  const { control } = useFormContext();
  const phoneButtonRef = useRef(null);
  const addressButtonRef = useRef(null);
  const emailButtonRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (openPhone) setOpenPhone(false);
        if (openAddress) setOpenAddress(false);
        if (openEmail) setOpenEmail(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPhone, openAddress, openEmail]);

  useEffect(() => {
    if (openPhone && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
    if (openAddress && addressInputRef.current) {
      addressInputRef.current.focus();
    }
    if (openEmail && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [openPhone, openAddress, openEmail]);

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
    const phoneExists = phoneFields.some(phone => getFormatedPhone(phone) === getFormatedPhone(phoneToAdd));
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
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={phoneButtonRef}
              onClick={() => setOpenPhone(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenPhone(false))
                handleEnterKeyDown(e, () => setOpenPhone(true))
              }}
            >
              <IconedButton
                text="Teléfono"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
              />
            </Box>
          }
          open={openPhone}
          on='click'
          onClose={() => {
            setPhoneToAdd(EMPTY_PHONE);
            setError();
            setOpenPhone(false);
            phoneButtonRef.current?.focus(); 
          }}
          closeOnDocumentClick
          position='top left'
        >
          <Form>
            <FieldsContainer width="60vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={phoneToAdd.ref}
                onChange={(e) => updateFieldToAdd(setPhoneToAdd, 'ref', e.target.value)}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
              >
                <input ref={phoneInputRef} />
              </FormField>
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
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setPhoneToAdd, 'areaCode', value);
                  if (validatePhone({ ...phoneToAdd, areaCode: value })) setError(undefined);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
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
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setPhoneToAdd, 'number', value);
                  if (validatePhone({ ...phoneToAdd, number: value })) setError(undefined);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
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
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={addressButtonRef}
              onClick={() => setOpenAddress(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenAddress(false))
                handleEnterKeyDown(e, () => setOpenAddress(true))
              }}
            >
              <IconedButton
                text="Dirección"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
              />
            </Box>
          }
          open={openAddress}
          on='click'
          onClose={() => {
            setAddressToAdd(EMPTY_ADDRESS);
            setOpenAddress(false);
            addressButtonRef.current?.focus();
          }}
          closeOnDocumentClick
          position='top left'
        >
          <Form>
            <FieldsContainer width="45vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={addressToAdd.ref}
                onChange={(e) => updateFieldToAdd(setAddressToAdd, 'ref', e.target.value)}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddAddress)}
              >
                <input ref={addressInputRef} />
              </FormField>
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
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setAddressToAdd, 'address', value);
                  if (value.trim()) setError(undefined);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddAddress)}
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
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={emailButtonRef}
              onClick={() => setOpenEmail(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenEmail(false))
                handleEnterKeyDown(e, () => setOpenEmail(true))
              }}
            >
              <IconedButton
                text="Email"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
              />
            </Box>
          }
          open={openEmail}
          on='click'
          onClose={() => {
            setEmailToAdd(EMPTY_EMAIL);
            setOpenEmail(false);
            emailButtonRef.current?.focus();
          }}
          position='top left'
          closeOnDocumentClick
        >
          <Form>
            <FieldsContainer width="50vw" alignItems="center" rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Referencia"
                value={emailToAdd.ref}
                onChange={(e) => updateFieldToAdd(setEmailToAdd, 'ref', e.target.value)}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddEmail)}
              >
                <input ref={emailInputRef} />
              </FormField>
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
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setEmailToAdd, 'email', value);
                  if (validateEmail(value)) setError(undefined);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddEmail)}
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