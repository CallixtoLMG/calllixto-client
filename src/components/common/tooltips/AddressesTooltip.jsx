import { Box } from "rebass";
import { Icon, List, ListItem, Popup } from "semantic-ui-react";

export const AddressesTooltip = ({ addresses }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {addresses.map(address => (
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
  );
};
