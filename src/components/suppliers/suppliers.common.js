import { getAddressesForDisplay, getPhonesForDisplay } from "@/utils";
import { PhonesTooltip, AddressesTooltip, CommentTooltip } from "@/components/common/tooltips";
import { Flex } from "@/components/common/custom";

const ATTRIBUTES = { ID: "id", NAME: "name", ADDRESSES: "addresses", PHONES: "phoneNumbers", COMMENT: "comments" };

const SUPPLIERS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (supplier) => supplier.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (supplier) =>
      <Flex justifyContent="space-between">
        {supplier.name}
        {supplier.comments && <CommentTooltip comment={supplier.comments} />}
      </Flex>
  },
  {
    id: 3,
    title: "Dirección",
    value: (supplier) => {
      const { primaryAddress, additionalAddresses } = getAddressesForDisplay(supplier.addresses || []);
      return (
        <Flex justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
        </Flex>
      );
    }
  },
  {
    id: 4,
    title: "Teléfono",
    width: 3,
    value: (supplier) => {
      const { primaryPhone, additionalPhones } = getPhonesForDisplay(supplier.phoneNumbers);
      return (
        <Flex justifyContent="space-between">
          {primaryPhone}
          {additionalPhones && <PhonesTooltip phones={additionalPhones} />}
        </Flex>
      );
    }
  },
];

export { ATTRIBUTES, SUPPLIERS_COLUMNS };

