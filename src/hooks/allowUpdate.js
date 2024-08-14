import { Box } from "@/components/common/custom";
import { useState } from "react";
import { ButtonGroup } from "semantic-ui-react";
import { IconnedButton } from "@/components/common/buttons";

export const useAllowUpdate = ({ canUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const button = (
    <>
      {canUpdate && (
        <Box>
          <ButtonGroup size="small">
            <IconnedButton
              text="Actualizar"
              icon="edit"
              onClick={() => setIsUpdating(true)} basic={!isUpdating}
              width="130px"
            />
            <IconnedButton
              text="Ver"
              icon="eye"
              basic={isUpdating}
              onClick={() => {
                setIsUpdating(false);
              }}
              width="130px"
            />
          </ButtonGroup>
        </Box>
      )}
    </>
  );

  return [isUpdating, button];
}
