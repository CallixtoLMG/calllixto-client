import { Flex } from "@/components/common/custom";
import { getAddressesForDisplay, getPhonesForDisplay } from "@/utils";
import { AddressesTooltip, CommentTooltip, PhonesTooltip } from "../common/tooltips";

export const ATTRIBUTES = { ID: 'id', NAME: 'name', ADDRESSES: 'addresses', PHONES: 'phoneNumbers', EMAILS: 'emails', COMMENT: 'comments', KEY: 'key', TEXT: 'text', VALUE: 'value', STATE: "state" };

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
