import { useState } from "react";
import { Box } from "rebass";
import { Checkbox } from "semantic-ui-react";

export const useAllowUpdate = () => {
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <Box marginY={15}>
      <Checkbox
        toggle checked={allowUpdate}
        onChange={(e, value) => setAllowUpdate(value.checked)} label="Actualizar"
      />
    </Box>
  );

  return [allowUpdate, button];
}
