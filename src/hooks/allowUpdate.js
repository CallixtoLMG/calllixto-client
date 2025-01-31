import { IconedButton } from "@/components/common/buttons";
import { Box } from "@/components/common/custom";
import { ICONS } from "@/common/constants";
import { useState } from "react";
import { ButtonGroup } from "semantic-ui-react";

export const useAllowUpdate = ({ canUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleButton = (
    <>
      {canUpdate && (
        <Box>
          <ButtonGroup size="small">
            <IconedButton
              text="Actualizar"
              icon={ICONS.EDIT}
              onClick={() => setIsUpdating(true)} basic={!isUpdating}
              width="130px"
            />
            <IconedButton
              text="Ver"
              icon={ICONS.EYE}
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

  return { isUpdating, toggleButton, setIsUpdating };
}
