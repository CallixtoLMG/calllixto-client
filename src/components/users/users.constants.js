import { Flex, Label, OverflowWrapper } from '@/common/components/custom';
import { CommentTooltip } from '@/common/components/tooltips';
import { DATE_FORMATS } from '@/common/constants';
import { getFormatedPhone } from '@/common/utils';
import { getFormatedDate } from '@/common/utils/dates';
import { ROLES } from '@/roles';

export const GET_USER_QUERY_KEY = 'getUser';
export const LIST_USERS_QUERY_KEY = 'listUsers';
export const USERS_FILTERS_KEY = 'usersFilters';
export const MAIN_KEY = 'username';
export const LIST_ATTRIBUTES = ["id", "firstName", "lastName", 'address', 'phoneNumber', 'username', "birthDate", "comments", "state", "role"];

export const USER_COLUMNS = [
  {
    id: 1,
    title: "Usuario",
    key: "username",
    sortable: true,
    width: 1,
    align: "left",
    value: (user) =>
      <Flex $justifyContent="space-between">
        <>
          < OverflowWrapper position="top left" maxWidth="15vw" popupContent={user.username} >
            {user.username}
          </OverflowWrapper >
        </>
        {user.comments && <CommentTooltip comment={user.comments} />}
      </Flex>,
    sortValue: (user) => user.username?.toLowerCase() ?? ""

  },
  {
    id: 2,
    title: "Apellido y nombre",
    key: "lastname",
    sortable: true,
    align: "left",
    width: 3,
    value: (user) => (
      <>
        < OverflowWrapper maxWidth="30vw" popupContent={`${user.lastName} ${user.firstName}`} >
          {user.lastName} {user.firstName}
        </OverflowWrapper >
      </>
    ),
    sortValue: (user) => user.firstName?.toLowerCase() ?? ""
  }, {
    id: 3,
    title: "Direccion",
    key: "address",
    sortable: true,
    width: 1,
    align: "left",
    value: (user) => (
      <>
        < OverflowWrapper maxWidth="20vw" popupContent={user.address} >
          {user.address}
        </OverflowWrapper >
      </>
    ),
    sortValue: (user) => user.address?.toLowerCase() ?? ""
  },
  {
    id: 4,
    title: "Teléfono",
    width: 1,
    value: (user) => getFormatedPhone(user.phoneNumber)
  },
  {
    id: 5,
    title: "Nacimiento",
    width: 1,
    value: (user) => {getFormatedDate(user.birthDate, DATE_FORMATS.ONLY_DATE) ?? ""}
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
      <Flex $alignItems="center" $justifyContent="space-between">
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
