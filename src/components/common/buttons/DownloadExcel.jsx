import { Icon, Button as SButton } from "semantic-ui-react";
import styled from "styled-components";
import * as XLSX from 'xlsx';

const Button = styled(SButton)`
  min-width: 170px!important;
  padding: 10px 0!important;
  max-height: 34px!important;
  margin: 0 !important;
`;

const ButtonDownload = () => {
  const handleDownload = () => {
    const mockData = [
      ['Codigo', 'Codigo Proveedor', 'Nombre', 'Precio', 'Comentarios'],
      ['AABB001', 'CP001', "Producto 1", 200, 'Comentarios...'],
      ['AABB002', 'CP002', "Producto 2", 300, 'Comentarios...'],
      ['AABB003', 'CP003', "Producto 3", 400, 'Comentarios...'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    XLSX.writeFile(wb, 'Ejemplo de Tabla.xlsx');
  };
  return (
    <Button onClick={handleDownload} color='blue'><Icon name="download" />Descargar plantilla</Button>
  )
};

export default ButtonDownload;
