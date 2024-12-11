import { Flex, OverflowCell } from "@/components/common/custom";
import { getAddressesForDisplay, getPhonesForDisplay } from "@/utils";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "../common/tooltips";

export const ATTRIBUTES = { ID: 'id', NAME: 'name', ADDRESSES: 'addresses', PHONES: 'phoneNumbers', EMAILS: 'emails', COMMENT: 'comments', KEY: 'key', TEXT: 'text', VALUE: 'value', STATE: "state", INACTIVE_REASON: "inactiveReason" };

export const HEADERS = [
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (customer) => {
      const { tags, name, comments } = customer;
      return (
        <Flex justifyContent="space-between" alignItems="center">
          <OverflowCell maxWidth="40vw" text={name} />
          <Flex columnGap="7px" alignItems="center" justifyContent="flex-end">
            {tags && <TagsTooltip tags={tags} />}
            {comments && <CommentTooltip comment={comments} />}
          </Flex>
        </Flex>
      );
    }
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
