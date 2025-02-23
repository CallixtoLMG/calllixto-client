import { Box, Icon } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { List, ListItem, Popup } from "semantic-ui-react";

export const PhonesTooltip = ({ phones, input }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {phones.map(phone => (
            <ListItem key={`${phone.areaCode}-${phone.number}`}>
              {phone.ref ? `${phone.ref}:` : "Contacto: "}<b>{getFormatedPhone(phone)}</b>
            </ListItem>
          ))}
        </List>
      }
      position="top center"
      trigger={
        input
          ? <Icon enablePointerEvents name={ICONS.LIST_UL} color={COLORS.YELLOW} />
          : <Box marginLeft="5px" marginRight="5px">
            <Icon name={ICONS.LIST_UL} color={COLORS.YELLOW} />
          </Box>
      }
    />
  );
};
