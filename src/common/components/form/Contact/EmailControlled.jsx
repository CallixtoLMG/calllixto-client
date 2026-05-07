import { validateEmail } from "@/common/utils";
import { EMAIL_TABLE_HEADERS } from "../form.constants";
import { ContactSectionControlled } from "./ContactSectionControlled";
import { EMPTY_EMAIL, hasDuplicateRef } from "./contact.helpers";

export const EmailControlled = () => (
  <ContactSectionControlled
    addButtonText="Email"
    emptyValue={EMPTY_EMAIL}
    fieldArrayName="emails"
    popupWidth="50vw"
    section="email"
    tableHeaders={EMAIL_TABLE_HEADERS}
    tableWrap
    validateItem={(emailsFields, emailToAdd) => {
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

      return nextError;
    }}
    fieldsConfig={[
      {
        name: 'ref',
        flex: '1',
        label: 'Referencia',
        placeholder: 'Trabajo',
        shouldClearError: ({ fields, value }) => !hasDuplicateRef(fields, value),
      },
      {
        name: 'email',
        flex: '2',
        label: 'Email',
        placeholder: 'Martinb@hotmail.com',
        required: true,
        shouldClearError: ({ fields, value }) => (
          validateEmail(value) &&
          !fields.some((email) => email.email === value)
        ),
      },
    ]}
  />
);
