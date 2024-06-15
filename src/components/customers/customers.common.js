import { formatAddressForDisplay, formatPhoneForDisplay, formatedSimplePhone } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, List, ListItem, Popup } from "semantic-ui-react";

export const ATTRIBUTES = { ID: 'id', NAME: 'name', ADDRESSES: 'addresses', PHONES: 'phoneNumbers', EMAILS: 'emails', COMMENT: 'comments', KEY: 'key', TEXT: 'text', VALUE: 'value' };

export const HEADERS = [
  {
    id: 1,
    width: 1,
    value: (customer) => customer.key
  },
  {
    id: 2,
    title: 'Nombre',
    align: 'left',
    value: (customer) =>
      <Flex justifyContent="space-between">
        {customer.name}
        {customer.comments && (
          <Popup
            size="mini"
            content={customer.comments}
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
    title: "Direccion",
    width: 4,
    align: "left",
    value: (customer) => {
      const { primaryAddress, additionalAddresses } = formatAddressForDisplay(customer.addresses || []);
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
    value: (customer) => {
      const { primaryPhone, additionalPhones } = formatPhoneForDisplay(customer.phoneNumbers);
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
  }
];

export const FILTERS = [
  { value: 'id', placeholder: 'Nombre' },
];
