import { formatAddressForDisplay, formatPhoneForDisplay } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

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
        {supplier.comments && (
          <Popup
            size="mini"
            content={supplier.comments}
            position="top center"
            trigger={
              <Box marginX="5px">
                <Icon name="info circle" color="yellow" />
              </Box>
            }
          />
        )}
      </Flex>
  },
  {
    id: 3,
    title: "Dirección",
    value: (supplier) => {
      const { primaryAddress } = formatAddressForDisplay(supplier.addresses || []);
      return (
        <Flex justifyContent="space-between">
          {primaryAddress}
        </Flex>
      );
    }
  },
  {
    id: 4,
    title: "Teléfono",
    width: 3,
    value: (customer) => {
      const { primaryPhone } = formatPhoneForDisplay(customer.phoneNumbers);
      return (
        <Flex justifyContent="space-between">
          {primaryPhone}
        </Flex>
      );
    }
  },
];

const FILTERS = [
  { value: 'id', placeholder: 'Id' },
  { value: 'name', placeholder: 'Nombre' },
];

export { ATTRIBUTES, FILTERS, SUPPLIERS_COLUMNS };

