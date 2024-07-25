import { Button } from "@/components/common/custom";
import { Icon } from "semantic-ui-react";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <Button
      padding="0"
      disabled={isLoading || !isDirty || disabled}
      type="button"
      color="brown"
      onClick={onClick}
      >
      <Icon name={isUpdating ? "undo" : "delete"} />{isUpdating ? "Restaurar" : "Limpiar"}
    </Button>
  )
}

export default Restore;
