import { useUserContext } from "@/User";
import { Box, IconedButton } from "@/components/common/custom";
import { RULES } from "@/roles";
import { useState } from "react";
import { ButtonGroup, Icon } from "semantic-ui-react";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box>
          <ButtonGroup size="small">
            <IconedButton
              icon
              labelPosition="left"
              type="button"
              basic={!allowUpdate}
              color="blue"
              width="fit-content"
              onClick={() => {
                setAllowUpdate(true);
              }}
            >
              <Icon name="edit" />
              Actualizar
            </IconedButton>
            <IconedButton
              icon
              labelPosition="right"
              type="button"
              basic={allowUpdate}
              color="blue"
              width="fit-content"
              onClick={() => {
                setAllowUpdate(false);
              }}
            >
              <Icon name="eye" />
              Ver
            </IconedButton>
          </ButtonGroup>
        </Box>
      )}
    </>
  );

  return [allowUpdate, button];
}
