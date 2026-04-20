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

const normalizeRef = (value = '') => value.trim().toLowerCase();

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

  const hasDuplicateRef = (fields = [], ref) => {
    const normalizedRef = normalizeRef(ref);

    if (!normalizedRef) return false;

    return fields.some((item) => normalizeRef(item.ref) === normalizedRef);
  };

  const clearErrorField = (section, field) => {
    if (!error?.[section]?.[field]) return;

    setError((prev) => {
      if (!prev?.[section]) return prev;

      const nextSection = { ...prev[section] };
      delete nextSection[field];

      const next = { ...prev };

      if (Object.keys(nextSection).length) {
        next[section] = nextSection;
      } else {
        delete next[section];
      }

      return Object.keys(next).length ? next : undefined;
    });
  };

  const handleAddPhone = () => {
    const nextError = {};

    if (hasDuplicateRef(phoneFields, phoneToAdd.ref)) {
      nextError.ref = 'La referencia ya existe.';
    }

    if (!validatePhone(phoneToAdd)) {
      nextError.phone = 'El área y el número deben sumar 10 dígitos.';
    } else {
      const phoneExists = phoneFields.some(
        phone => getFormatedPhone(phone) === getFormatedPhone(phoneToAdd)
      );

      if (phoneExists) {
        nextError.phone = 'El teléfono ya existe.';
      }
    }

    if (Object.keys(nextError).length) {
      setError({ phone: nextError });
      return;
    }

    appendPhone(phoneToAdd);
    setPhoneToAdd(EMPTY_PHONE);
    setError(undefined);
    setOpenPhone(false);
  };

  const handleAddAddress = () => {
    const nextError = {};

    if (hasDuplicateRef(addressFields, addressToAdd.ref)) {
      nextError.ref = 'La referencia ya existe.';
    }

    if (!addressToAdd.address?.trim()) {
      nextError.address = 'Campo requerido.';
    } else {
      const addressExists = addressFields.some(
        (address) => address.address === addressToAdd.address
      );

      if (addressExists) {
        nextError.address = 'La dirección ya existe.';
      }
    }

    if (Object.keys(nextError).length) {
      setError({ address: nextError });
      return;
    }

    appendAddress(addressToAdd);
    setAddressToAdd(EMPTY_ADDRESS);
    setError(undefined);
    setOpenAddress(false);
  };

  const handleAddEmail = () => {
    const nextError = {};

    if (hasDuplicateRef(emailsFields, emailToAdd.ref)) {
      nextError.ref = 'La referencia ya existe.';
    }

    if (!validateEmail(emailToAdd.email)) {
      nextError.email = 'El correo electrónico no es válido.';
    } else {
      const emailExists = emailsFields.some(
        (email) => email.email === emailToAdd.email
      );

      if (emailExists) {
        nextError.email = 'El correo electrónico ya existe.';
      }
    }

    if (Object.keys(nextError).length) {
      setError({ email: nextError });
      return;
    }

    appendEmail(emailToAdd);
    setEmailToAdd(EMPTY_EMAIL);
    setError(undefined);
    setOpenEmail(false);
  };

  return (
    <FieldsContainer $columnGap="15px">
      <Flex $flex="1" $flexDirection="column">
        <Popup
          trigger={
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={phoneButtonRef}
              onClick={() => setOpenPhone(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenPhone(false));
                handleEnterKeyDown(e, () => setOpenPhone(true));
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
            setError(undefined);
            setOpenPhone(false);
            phoneButtonRef.current?.focus();
          }}
          closeOnDocumentClick
          position='top left'
        >
          <Form>
            <FieldsContainer width="60vw" $alignItems="center" $rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Casa"
                value={phoneToAdd.ref}
                error={error?.phone?.ref ? {
                  content: error.phone.ref,
                  pointing: 'above',
                } : null}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setPhoneToAdd, 'ref', value);
                  if (!hasDuplicateRef(phoneFields, value)) clearErrorField('phone', 'ref');
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
              >
                <input ref={phoneInputRef} />
              </FormField>
              <FormField
                flex="1"
                label="Área"
                control={Input}
                error={error?.phone?.phone ? {
                  content: error.phone.phone,
                  pointing: 'above',
                } : null}
                required
                maxLength="4"
                placeholder="385"
                value={phoneToAdd.areaCode}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setPhoneToAdd, 'areaCode', value);

                  if (
                    validatePhone({ ...phoneToAdd, areaCode: value }) &&
                    !phoneFields.some(
                      phone => getFormatedPhone(phone) === getFormatedPhone({ ...phoneToAdd, areaCode: value })
                    )
                  ) {
                    clearErrorField('phone', 'phone');
                  }
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
              />
              <FormField
                flex="1"
                label="Número"
                control={Input}
                error={error?.phone?.phone ? {
                  content: error.phone.phone,
                  pointing: 'above',
                } : null}
                required
                maxLength="7"
                placeholder="5228706"
                value={phoneToAdd.number}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setPhoneToAdd, 'number', value);

                  if (
                    validatePhone({ ...phoneToAdd, number: value }) &&
                    !phoneFields.some(
                      phone => getFormatedPhone(phone) === getFormatedPhone({ ...phoneToAdd, number: value })
                    )
                  ) {
                    clearErrorField('phone', 'phone');
                  }
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddPhone}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPhone)}
                alignSelf="end"
                height="38px"
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box $marginTop="8px" />
        <Table
          headers={PHONE_TABLE_HEADERS}
          actions={[
            { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (phone, index) => removePhone(index), tooltip: 'Eliminar' }
          ]}
          elements={phoneFields}
        />
      </Flex>

      <Flex $flex="1" $flexDirection="column">
        <Popup
          trigger={
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={addressButtonRef}
              onClick={() => setOpenAddress(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenAddress(false));
                handleEnterKeyDown(e, () => setOpenAddress(true));
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
            setError(undefined);
            setOpenAddress(false);
            addressButtonRef.current?.focus();
          }}
          closeOnDocumentClick
          position='top left'
        >
          <Form>
            <FieldsContainer width="45vw" $alignItems="center" $rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Casa"
                value={addressToAdd.ref}
                error={error?.address?.ref ? {
                  content: error.address.ref,
                  pointing: 'above',
                } : null}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setAddressToAdd, 'ref', value);
                  if (!hasDuplicateRef(addressFields, value)) clearErrorField('address', 'ref');
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddAddress)}
              >
                <input ref={addressInputRef} />
              </FormField>
              <FormField
                flex="2"
                label="Dirección"
                control={Input}
                error={error?.address?.address ? {
                  content: error.address.address,
                  pointing: 'above',
                } : null}
                required
                placeholder="Mitre 525 9c"
                value={addressToAdd.address}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setAddressToAdd, 'address', value);

                  const addressExists = addressFields.some(
                    (address) => address.address === value
                  );

                  if (value.trim() && !addressExists) {
                    clearErrorField('address', 'address');
                  }
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddAddress)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddAddress}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddAddress)}
                alignSelf="end"
                height="38px"
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box $marginTop="8px" />
        <Table
          $wrap
          headers={ADDRESS_TABLE_HEADERS}
          actions={[
            { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (address, index) => removeAddress(index), tooltip: 'Eliminar' }
          ]}
          elements={addressFields}
        />
      </Flex>

      <Flex $flex="1" $flexDirection="column">
        <Popup
          trigger={
            <Box
              width="fit-content"
              tabIndex={0}
              role="button"
              ref={emailButtonRef}
              onClick={() => setOpenEmail(true)}
              onKeyDown={(e) => {
                handleEscapeKeyDown(e, () => setOpenEmail(false));
                handleEnterKeyDown(e, () => setOpenEmail(true));
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
            setError(undefined);
            setOpenEmail(false);
            emailButtonRef.current?.focus();
          }}
          position='top left'
          closeOnDocumentClick
        >
          <Form>
            <FieldsContainer width="50vw" $alignItems="center" $rowGap="5px">
              <FormField
                flex="1"
                label="Referencia"
                control={Input}
                placeholder="Trabajo"
                value={emailToAdd.ref}
                error={error?.email?.ref ? {
                  content: error.email.ref,
                  pointing: 'above',
                } : null}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setEmailToAdd, 'ref', value);
                  if (!hasDuplicateRef(emailsFields, value)) clearErrorField('email', 'ref');
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddEmail)}
              >
                <input ref={emailInputRef} />
              </FormField>
              <FormField
                flex="2"
                label="Email"
                control={Input}
                error={error?.email?.email ? {
                  content: error.email.email,
                  pointing: 'above',
                } : null}
                required
                placeholder="Martinb@hotmail.com"
                value={emailToAdd.email}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFieldToAdd(setEmailToAdd, 'email', value);

                  const emailExists = emailsFields.some(
                    (email) => email.email === value
                  );

                  if (validateEmail(value) && !emailExists) {
                    clearErrorField('email', 'email');
                  }
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddEmail)}
              />
              <IconedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={handleAddEmail}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddEmail)}
                alignSelf="end"
                height="38px"
              />
            </FieldsContainer>
          </Form>
        </Popup>
        <Box $marginTop="8px" />
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
  );
};