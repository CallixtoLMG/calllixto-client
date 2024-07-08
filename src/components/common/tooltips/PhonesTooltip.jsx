import { formatedSimplePhone } from "@/utils";
import { Icon, List, ListItem, Popup } from "semantic-ui-react";
import { Box } from "@/components/common/custom";

export const PhonesTooltip = ({ phones }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {phones.map(phone => (
            <ListItem key={`${phone.areaCode}-${phone.number}`}>
              {phone.ref ? `${phone.ref}:` : "Contacto: "}<b>{formatedSimplePhone(phone)}</b>
            </ListItem>
          ))}
        </List>
      }
      position="top center"
      trigger={
        <Box marginLeft="5px" marginRight="5px">
          <Icon name="list ul" color="yellow" />
        </Box>
      }
    />
  );
};
