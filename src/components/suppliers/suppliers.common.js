import { formatAddressForDisplay, formatPhoneForDisplay, formatedSimplePhone } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, List, ListItem, Popup } from "semantic-ui-react";

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
      const { primaryAddress, additionalAddresses } = formatAddressForDisplay(supplier.addresses || []);
      return (
        <Flex justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && (
            <Popup
              size="mini"
              content={
                <List>
                  {additionalAddresses.map(address => (
                    <ListItem key={`${address.ref}-${address.address}`}>
                      {address.ref ? `${address.ref}: ` : "Dirección: "}<b>{address.address}</b>
                    </ListItem>
                  ))}
                </List>
              }
              position="top center"
              trigger={
                <Box marginX="5px">
                  <Icon name="list ul" color="yellow" />
                </Box>
              }
            />
          )}
        </Flex>
      );
    }
  },
  {
    id: 4,
    title: "Teléfono",
    width: 3,
    value: (supplier) => {
      const { primaryPhone, additionalPhones } = formatPhoneForDisplay(supplier.phoneNumbers);
      return (
        <Flex justifyContent="space-between">
          {primaryPhone}
          {additionalPhones && (
            <Popup
              size="mini"
              content={
                <List>
                  {additionalPhones.map(phone => (
                    <ListItem key={`${phone.areaCode}-${phone.number}`}>
                      {phone.ref ? `${phone.ref}:` : "Contacto: "}<b>{formatedSimplePhone(phone)}</b>
                    </ListItem>
                  ))}
                </List>
              }
              position="top center"
              trigger={
                <Box marginX="5px">
                  <Icon name="list ul" color="yellow" />
                </Box>
              }
            />
          )}
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

