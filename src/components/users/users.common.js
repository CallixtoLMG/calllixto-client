import { Flex } from '@/components/common/custom';
import { ROLES } from '@/roles';
import { getAddressesForDisplay, getPhonesForDisplay } from '@/utils';
import { AddressesTooltip, PhonesTooltip } from '../common/tooltips';

const ATTRIBUTES = { ID: "id", FIRST_NAME: "firstName", LAST_NAME: "lastName", ADDRESSES: 'addresses', PHONES: 'phoneNumbers', EMAILS: 'emails', DATE_OF_BIRTH: "dateOfBirth", COMMENT: "comments", STATE: "state" };

const USER_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (user) => user.emails[0]
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (user) =>
      <Flex justifyContent="space-between">
        {user.firstName}
      </Flex>
  }, {
    id: 3,
    title: "Apellido",
    align: "left",
    value: (user) =>
      <Flex justifyContent="space-between">
        {user.lastName}
      </Flex>
  }, {
    id: 4,
    title: "Direccion",
    width: 4,
    align: "left",
    value: (user) => {
      const { primaryAddress, additionalAddresses } = getAddressesForDisplay(user.addresses || []);
      return (
        <Flex justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
        </Flex>
      );
    }
  },
  {
    id: 5,
    title: "Teléfono",
    width: 3,
    value: (user) => {
      const { primaryPhone, additionalPhones } = getPhonesForDisplay(user.phoneNumbers);
      return (
        <Flex justifyContent="space-between">
          {primaryPhone}
          {additionalPhones && <PhonesTooltip phones={additionalPhones} />}
        </Flex>
      );
    }
  }
];

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Administrador',
  USER: 'Usuario',
};

export const getRoleOptions = () => {
  return Object.entries(ROLES)
    .filter(([key]) => key !== 'CALLIXTO')
    .map(([key, value]) => ({
      key: value,
      text: ROLE_LABELS[key] || key,
      value: value,
    }));
};

export {
  ATTRIBUTES, USER_COLUMNS
};

