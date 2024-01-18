import { Checkbox } from "@/components/common/custom";
import { useState } from "react";
import { Box } from "rebass";

export const useAllowUpdate = () => {
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <Box marginBottom={15}>
      <Checkbox
        toggle checked={allowUpdate}
        onChange={(e, value) => setAllowUpdate(value.checked)} label="Actualizar"
      />
    </Box>
  );

  return [allowUpdate, button];
}
