import { FieldsContainer } from '../../custom';
import { AddressView } from './AddressView';
import { EmailView } from './EmailView';
import { PhoneView } from './PhoneView';

export const ContactView = ({ phoneNumbers = [], addresses = [], emails = [] }) => {
  return (
    <FieldsContainer $columnGap="15px">
      <PhoneView phoneNumbers={phoneNumbers} />
      <AddressView addresses={addresses} />
      <EmailView emails={emails} />
    </FieldsContainer>
  )
}
