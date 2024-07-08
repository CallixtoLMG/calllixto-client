import { Checkbox } from "@/components/common/custom";
import { useState } from "react";
import { RULES } from "@/roles";
import { useUserContext } from "@/User";
import { Box } from "@/components/common/custom";

export const useAllowUpdate = () => {
  const { role } = useUserContext();
  const [allowUpdate, setAllowUpdate] = useState(false);

  const button = (
    <>
      {RULES.canUpdate[role] && (
        <Box marginBottom="15px">
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
