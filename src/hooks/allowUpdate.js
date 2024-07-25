import { useUserContext } from "@/User";
import { Box } from "@/components/common/custom";
import { RULES } from "@/roles";
import { useState } from "react";
import { Button, ButtonGroup, Icon } from "semantic-ui-react";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box>
          <ButtonGroup size="small">
            <Button
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
            </Button>
            <Button
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
            </Button>
          </ButtonGroup>
        </Box>
      )}
    </>
  );

  return [allowUpdate, button];
}
