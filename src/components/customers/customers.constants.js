import { Flex, Label, OverflowWrapper } from "@/common/components/custom";
import { getAddressesForDisplay, getPhonesForDisplay } from "@/common/utils";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "../../common/components/tooltips";

export const LIST_CUSTOMERS_QUERY_KEY = 'listCustomers';
export const GET_CUSTOMER_QUERY_KEY = 'getCustomer';
export const CUSTOMERS_FILTERS_KEY = 'customersFilters';
export const LIST_ATTRIBUTES = ['id', 'name', 'addresses', 'phoneNumbers', 'comments', "state", "tags"];

export const HEADERS = [
  {
    id: 1,
    title: 'Nombre',
    align: 'left',
    width: 9,
    key: "name",
    sortable: true,
    value: (customer) => {
      const { tags, name, comments } = customer;
      return (
        <Flex $justifyContent="space-between" $alignItems="center">
          <OverflowWrapper maxWidth="45vw" popupContent={name}>
            {name}
          </OverflowWrapper>
          <Flex $columnGap="7px" $alignItems="center" $justifyContent="flex-end">
            {tags && <TagsTooltip maxWidthOverflow="8vw" tooltip="true" tags={tags} />}
            {comments && <CommentTooltip tooltip="true" comment={comments} />}
          </Flex>
        </Flex>
      );
    },
    sortValue: (customer) => customer.name ?? ""
  },
  {
    id: 2,
    title: "Direccion",
    key: "addresses",
    sortable: true,
    width: 5,
    align: "left",
    value: (customer) => {
      const { primaryAddress, additionalAddresses } = getAddressesForDisplay(customer.addresses || []);
      return (
        <Flex $justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
        </Flex>
      );
    },
    sortValue: (customer) => customer.addresses?.[0]?.address ?? ""
  },
  {
    id: 3,
    title: "Teléfono",
    width: 3,
    value: (customer) => {
      const { primaryPhone, additionalPhones } = getPhonesForDisplay(customer.phoneNumbers);
      return (
        <Flex $justifyContent="space-between">
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
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));
