import { Flex, Label } from '@/common/components/custom';
import OverflowWrapper from '@/common/components/custom/OverflowWrapper';
import { CommentTooltip } from '@/common/components/tooltips';
import { DATE_FORMATS } from '@/common/constants';
import { getFormatedPhone } from '@/common/utils';
import { getFormatedDate } from '@/common/utils/dates';
import { ROLES } from '@/roles';

export const GET_USER_QUERY_KEY = 'getUser';
export const LIST_USERS_QUERY_KEY = 'listUsers';

export const ATTRIBUTES = {
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

export const USER_COLUMNS = [
  {
    id: 1,
    title: "Usuario",
    width: 3,
    align: "left",
    value: (user) =>
      <Flex justifyContent="space-between">
        < OverflowWrapper maxWidth="15vw" popupContent={user.username} >
          {user.username}
        </OverflowWrapper >
        {user.comments && <CommentTooltip comment={user.comments} />}
      </Flex>
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    width: 3,
    value: (user) => (
      < OverflowWrapper maxWidth="15vw" popupContent={user.firstName} >
        {user.firstName}
      </OverflowWrapper >)
  }, {
    id: 3,
    title: "Apellido",
    align: "left",
    width: 3,
    value: (user) => (
      < OverflowWrapper maxWidth="15vw" popupContent={user.lastName} >
        {user.lastName}
      </OverflowWrapper >)
  }, {
    id: 4,
    title: "Direccion",
    width: 3,
    align: "left",
    value: (user) => (
      < OverflowWrapper maxWidth="20vw" popupContent={user.address} >
        {user.address}
      </OverflowWrapper >)
  },
  {
    id: 5,
    title: "Teléfono",
    width: 2,
    value: (user) => getFormatedPhone(user.phoneNumber)
  },
  {
    id: 6,
    title: "Nacimiento",
    width: 1,
    value: (user) => getFormatedDate(user.birthDate, DATE_FORMATS.ONLY_DATE)
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

export const EMPTY_FILTERS = { username: '', firstName: '', state: USER_STATES.ACTIVE.id };
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

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
};

export const getUsersRoleOptions = () => {
  return Object.entries(ROLES)
    .filter(([key]) => !["CALLIXTO"].includes(key))
    .map(([key, value]) => ({
      key: value,
      text: ROLE_LABELS[key] || key,
      value: value,
    }));
};

export const USERS_ROLE_OPTIONS = getUsersRoleOptions()
  .map((role, index) => ({
    key: `${role.value}-${index}`,
    text: role.text,
    value: role.value,
  }))
  .reverse();
