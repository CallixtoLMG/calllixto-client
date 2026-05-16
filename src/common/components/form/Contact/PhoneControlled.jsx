import { getFormatedPhone, validatePhone } from "@/common/utils";
import { PHONE_TABLE_HEADERS } from "../form.constants";
import { ContactSectionControlled } from "./ContactSectionControlled";
import { EMPTY_PHONE, hasDuplicateRef } from "./contact.helpers";

export const PhoneControlled = () => (
  <ContactSectionControlled
    addButtonText="Teléfono"
    emptyValue={EMPTY_PHONE}
    fieldArrayName="phoneNumbers"
    popupWidth="60vw"
    section="phone"
    tableHeaders={PHONE_TABLE_HEADERS}
    validateItem={(phoneFields, phoneToAdd) => {
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

      return nextError;
    }}
    fieldsConfig={[
      {
        name: 'ref',
        flex: '1',
        label: 'Referencia',
        placeholder: 'Casa',
        shouldClearError: ({ fields, value }) => !hasDuplicateRef(fields, value),
      },
      {
        name: 'areaCode',
        errorKey: 'phone',
        flex: '1',
        label: 'Área',
        maxLength: '4',
        placeholder: '385',
        required: true,
        shouldClearError: ({ fields, nextItem }) => (
          validatePhone(nextItem) &&
          !fields.some(phone => getFormatedPhone(phone) === getFormatedPhone(nextItem))
        ),
      },
      {
        name: 'number',
        errorKey: 'phone',
        flex: '1',
        label: 'Número',
        maxLength: '7',
        placeholder: '5228706',
        required: true,
        shouldClearError: ({ fields, nextItem }) => (
          validatePhone(nextItem) &&
          !fields.some(phone => getFormatedPhone(phone) === getFormatedPhone(nextItem))
        ),
      },
    ]}
  />
);
