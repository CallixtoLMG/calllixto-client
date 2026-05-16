import { FieldsContainer } from '../../custom';
import { AddressControlled } from './AddressControlled';
import { EmailControlled } from './EmailControlled';
import { PhoneControlled } from './PhoneControlled';

export const ContactControlled = () => {
  return (
    <FieldsContainer $columnGap="50px">
      <PhoneControlled />
      <AddressControlled />
      <EmailControlled />
    </FieldsContainer>
  );
};
