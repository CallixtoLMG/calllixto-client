import { FieldsContainer, FormField } from '../../custom';
import { Table } from '../../table';
import { ADDRESS_TABLE_HEADERS, EMAIL_TABLE_HEADERS, PHONE_TABLE_HEADERS } from '../form.constants';

export const ContactView = ({ phoneNumbers = [], addresses = [], emails = [] }) => {
  return (
    <FieldsContainer $columnGap="15px">
      <FormField flex="1">
        <Table
          headers={PHONE_TABLE_HEADERS}
          elements={phoneNumbers}
          mainKey={(phone, index) => `${phone.ref}-${phone.areaCode}-${phone.number}-${index}`}
        />
      </FormField>
      <FormField flex="1">
        <Table
          $wrap
          headers={ADDRESS_TABLE_HEADERS}
          elements={addresses}
          mainKey={(address, index) => `${address.ref}-${address.address}-${index}`}
        />
      </FormField>
      <FormField flex="1">
        <Table
          $wrap
          headers={EMAIL_TABLE_HEADERS}
          elements={emails}
          mainKey={(email, index) => `${email.ref}-${email.email}-${index}`}
        />
      </FormField>
    </FieldsContainer>
  )
}