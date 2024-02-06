import { Icon, Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: 170px!important;
  padding: 10px 0!important;
`;

export const Restore = ({ isUpdating, isLoading, isDirty, onClick }) => {
  return (
    <Button
      disabled={isLoading || !isDirty}
      type="button"
      color="brown"
      onClick={onClick}
      >
      <Icon name={isUpdating ? "undo" : "delete"} />{isUpdating ? "Restaurar" : "Limpiar"}
    </Button>
  )
}

export default Restore;
