import { Icon, Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 120px!important;
  padding: 10px 0!important;
`;

export const Restore = ({ isUpdating, isLoading, isDirty, onClick, disabled }) => {
  return (
    <Button
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
