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
      ['Codigo', "Codigo proveedor", 'Nombre', 'Precio', "Comentario"],
      ['A00', "A0-A1", "Producto1", '100', "comentario 1"],
      ['A01', "A0-A2", "Producto2", '1000', "comentario 2"],
      ['A02', "A0-A3", "Producto3", '1000,25', "comentario 3"],
      ['A03', "A0-A4", "Producto4", '1000000,25', "comentario 4"],
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
