import { useUserContext } from "@/User";
import { Box } from "@/components/common/custom";
import { RULES } from "@/roles";
import { useState } from "react";
import { ButtonGroup } from "semantic-ui-react";
import { IconnedButton } from "@/components/common/buttons";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box>
          <ButtonGroup size="small">
            <IconnedButton
              text="Actualizar"
              icon="edit"
              onClick={() => setAllowUpdate(true)} basic={!allowUpdate}
              width="130px"
            />
            <IconnedButton
              text="Ver"
              icon="eye"
              basic={allowUpdate}
              onClick={() => {
                setAllowUpdate(false);
              }}
              width="130px"
            />
          </ButtonGroup>
        </Box>
      )}
    </>
  );

  return [allowUpdate, button];
}
