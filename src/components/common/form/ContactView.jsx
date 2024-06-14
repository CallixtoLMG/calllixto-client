import { FieldsContainer, FormField} from '../custom';
import { Table } from '../table';
import { ADDRESS_TABLE_HEADERS, EMAIL_TABLE_HEADERS, PHONE_TABLE_HEADERS } from './form.common';

export const ContactView = ({ phoneNumbers = [], addresses = [], emails = [] }) => {
  return (
    <FieldsContainer columnGap="50px">
      <FormField width="33%">
        <Table
          headers={PHONE_TABLE_HEADERS}
          elements={phoneNumbers}
        />
      </FormField>
      <FormField flex="1">
        <Table
          headers={ADDRESS_TABLE_HEADERS}
          elements={addresses}
        />
      </FormField>
      <FormField flex="1">
        <Table
          headers={EMAIL_TABLE_HEADERS}
          elements={emails}
        />
      </FormField>
    </FieldsContainer>
  )
}