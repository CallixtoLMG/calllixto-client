import { useUserContext } from "@/User";
import { Box, Checkbox } from "@/components/common/custom";
import { RULES } from "@/roles";
import { useState } from "react";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box>
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
