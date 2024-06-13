import { Checkbox } from "@/components/common/custom";
import { useState } from "react";
import { Box } from "rebass";
import { RULES } from "@/roles";
import { useUserContext } from "@/User";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box marginBottom={15}>
          <Checkbox
            toggle checked={allowUpdate}
            onChange={(e, value) => setAllowUpdate(value.checked)} label="Actualizar"
          />
        </Box>
      )}
    </>
  );

  return [allowUpdate, button];
}
