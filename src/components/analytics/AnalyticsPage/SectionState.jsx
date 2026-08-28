import { StateBox } from "./styles";

const SectionState = ({ isLoading, error, empty, emptyMessage, children }) => {
  if (isLoading) return <StateBox>Cargando análisis...</StateBox>;
  if (error) return <StateBox>No se pudo cargar este bloque.</StateBox>;
  if (empty) return <StateBox>{emptyMessage}</StateBox>;

  return children;
};

export default SectionState;
