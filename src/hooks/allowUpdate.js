import { Box, IconedButton } from "@/components/common/custom";
import { useState } from "react";
import { ButtonGroup, Icon } from "semantic-ui-react";

export const useAllowUpdate = ({ canUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const button = (
    <>
      {canUpdate && (
        <Box>
          <ButtonGroup size="small">
            <IconedButton
              icon
              labelPosition="left"
              type="button"
              basic={!isUpdating}
              color="blue"
              width="fit-content"
              onClick={() => {
                setIsUpdating(true);
              }}
            >
              <Icon name="edit" />
              Actualizar
            </IconedButton>
            <IconedButton
              icon
              labelPosition="right"
              type="button"
              basic={isUpdating}
              color="blue"
              width="fit-content"
              onClick={() => {
                setIsUpdating(false);
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

  return [isUpdating, button];
}
