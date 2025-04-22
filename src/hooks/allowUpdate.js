import { IconedButton } from "@/common/components/buttons";
import { Box } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { useState } from "react";
import { ButtonGroup } from "semantic-ui-react";

export const useAllowUpdate = ({ canUpdate, onBeforeView }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleViewClick = async () => {
    const canView = await onBeforeView?.();
    if (!canView) return;
  
    setIsUpdating(false);
  };

  const toggleButton = (
    <>
      {canUpdate && (
        <Box>
          <ButtonGroup size="small">
            <IconedButton
              text="Actualizar"
              icon={ICONS.EDIT}
              onClick={() => setIsUpdating(true)}
              basic={!isUpdating}
              color={COLORS.BLUE}
              width="130px"
            />
            <IconedButton
              text="Ver"
              icon={ICONS.EYE}
              basic={isUpdating}
              color={COLORS.BLUE}
              onClick={handleViewClick}
              width="130px"
            />
          </ButtonGroup>
        </Box>
      )}
    </>
  );

  return { isUpdating, toggleButton, setIsUpdating };
};
