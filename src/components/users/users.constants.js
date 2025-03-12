// import { Flex } from '@/components/common/custom';
import { Flex, Label } from '@/common/components/custom';
import { getFormatedPhone } from '@/common/utils';
import { ROLES } from '@/roles';
// import { getAddressesForDisplay, getPhonesForDisplay } from '@/utils';
// import { AddressesTooltip, PhonesTooltip } from '../common/tooltips';

export const GET_USER_QUERY_KEY = 'getUser';
export const LIST_USERS_QUERY_KEY = 'listUsers';

const ATTRIBUTES = {
  ID: "id",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  ADDRESS: 'address',
  PHONE_NUMBER: 'phoneNumber',
  USERNAME: 'username',
  BIRTH_DATE: "birthDate",
  COMMENT: "comments",
  STATE: "state",
  ROLE: "role"
};

const USER_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 3,
    value: (user) => user.username
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    width: 2,
    value: (user) =>
      <Flex justifyContent="space-between">
        {user.firstName}
      </Flex>
  }, {
    id: 3,
    title: "Apellido",
    align: "left",
    width: 2,
    value: (user) =>
      <Flex justifyContent="space-between">
        {user.lastName}
      </Flex>
  }, {
    id: 4,
    title: "Direccion",
    width: 4,
    align: "left",
    value: (user) => user.address
    // value: (user) => {
    //   const { primaryAddress, additionalAddresses } = getAddressesForDisplay(user.addresses || []);
    //   return (
    //     <Flex justifyContent="space-between">
    //       {primaryAddress}
    //       {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
    //     </Flex>
    //   );
    // }
  },
  {
    id: 5,
    title: "Teléfono",
    width: 2,
    value: (user) => getFormatedPhone(user.phoneNumber)
    //   value: (user) => {
    //     const { primaryPhone, additionalPhones } = getPhonesForDisplay(user.phoneNumbers);
    //     return (
    //       <Flex justifyContent="space-between">
    //         {primaryPhone}
    //         {additionalPhones && <PhonesTooltip phones={additionalPhones} />}
    //       </Flex>
    //     );
    //   }
  }
];

export const USER_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const EMPTY_FILTERS = { username: '', firstName: ''};
// export const EMPTY_FILTERS = { id: '', name: '', state: USER_STATES.ACTIVE.id };
export const EMPTY_USER = {
  firstName: '',
  lastName: '',
  role: '',
  birthDate: '',
  phoneNumber: {},
  address: '',
  username: '',
  comments: ''
};

export const USER_STATE_OPTIONS = Object.values(USER_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

// export const USERS_STATE_OPTIONS = [
//   ...Object.entries(USER_STATES).map(([key, value]) => ({
//     key,
//     text: (
//       <Flex alignItems="center" justifyContent="space-between">
//         {value.title}&nbsp;<Label color={value.color} circular empty />
//       </Flex>
//     ),
//     value: key
//   }))
// ];

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

