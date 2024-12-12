import { Box } from "@/components/common/custom";
import { COLORS, ICONS } from "@/constants";
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
        <Box marginLeft="5px" marginRight="5px">
          <Icon name={ICONS.LIST_UL} color={COLORS.BLUE} />
        </Box>
      }
    />
  );
};
