import { IconnedButton } from ".";

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <IconnedButton
      text={isUpdating ? "Restaurar" : "Limpiar"}
      icon={isUpdating ? "undo" : "delete"}
      disabled={isLoading || !isDirty || disabled}
      color="brown"
      onClick={onClick}
      width="110px"
    />
  )
}

export default Restore;
