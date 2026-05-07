import { ERROR_MESSAGES, FIELD_LABELS } from "@/common/constants";
import { ADDRESS_TABLE_HEADERS } from "../form.constants";
import { ContactSectionControlled } from "./ContactSectionControlled";
import { EMPTY_ADDRESS, hasDuplicateRef } from "./contact.helpers";

export const AddressControlled = () => (
  <ContactSectionControlled
    addButtonText="Dirección"
    emptyValue={EMPTY_ADDRESS}
    fieldArrayName="addresses"
    popupWidth="45vw"
    section="address"
    tableHeaders={ADDRESS_TABLE_HEADERS}
    tableWrap
    validateItem={(addressFields, addressToAdd) => {
      const nextError = {};

      if (hasDuplicateRef(addressFields, addressToAdd.ref)) {
        nextError.ref = 'La referencia ya existe.';
      }

      if (!addressToAdd.address?.trim()) {
        nextError.address = ERROR_MESSAGES.REQUIRED_FIELD;
      } else {
        const addressExists = addressFields.some(
          (address) => address.address === addressToAdd.address
        );

        if (addressExists) {
          nextError.address = 'La dirección ya existe.';
        }
      }

      return nextError;
    }}
    fieldsConfig={[
      {
        name: 'ref',
        flex: '1',
        label: FIELD_LABELS.REFERENCE,
        placeholder: 'Casa',
        shouldClearError: ({ fields, value }) => !hasDuplicateRef(fields, value),
      },
      {
        name: 'address',
        flex: '2',
        label: FIELD_LABELS.ADDRESS,
        placeholder: 'Mitre 525 9c',
        required: true,
        shouldClearError: ({ fields, value }) => (
          value.trim() &&
          !fields.some((address) => address.address === value)
        ),
      },
    ]}
  />
);
