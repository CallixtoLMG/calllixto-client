import { Flex, Label } from "@/common/components/custom";
import { getAddressesForDisplay, getPhonesForDisplay } from "@/common/utils";
import { AddressesTooltip, CommentTooltip, PhonesTooltip } from "../../common/components/tooltips";

export const ATTRIBUTES = { ID: 'id', NAME: 'name', ADDRESSES: 'addresses', PHONES: 'phoneNumbers', EMAILS: 'emails', COMMENT: 'comments', KEY: 'key', TEXT: 'text', VALUE: 'value', STATE: "state", INACTIVE_REASON: "inactiveReason", TAGS: "tags" };

export const HEADERS = [
  {
    id: 1,
    title: 'Nombre',
    align: 'left',
    value: (customer) =>
      <Flex justifyContent="space-between">
        {customer.name}
        {customer.comments && <CommentTooltip comment={customer.comments} />}
      </Flex>
  },
  {
    id: 2,
    title: "Direccion",
    width: 4,
    align: "left",
    value: (customer) => {
      const { primaryAddress, additionalAddresses } = getAddressesForDisplay(customer.addresses || []);
      return (
        <Flex justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
        </Flex>
      );
    }
  },
  {
    id: 3,
    title: "Teléfono",
    width: 3,
    value: (customer) => {
      const { primaryPhone, additionalPhones } = getPhonesForDisplay(customer.phoneNumbers);
      return (
        <Flex justifyContent="space-between">
          {primaryPhone}
          {additionalPhones && <PhonesTooltip phones={additionalPhones} />}
        </Flex>
      );
    }
  }
];

export const CUSTOMER_STATES = {
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

export const EMPTY_CUSTOMER = { name: '', phoneNumbers: [], addresses: [], emails: [], comments: '' };
export const EMPTY_FILTERS = { name: '', state: CUSTOMER_STATES.ACTIVE.id };

export const CUSTOMER_STATES_OPTIONS = Object.values(CUSTOMER_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));
