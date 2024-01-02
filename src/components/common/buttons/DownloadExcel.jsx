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
      ['Codigo', 'Codigo Proveedor', 'Nombre', 'Precio'],
      ['a000', 'CP001', "Producto1", '200'],
      ['a001', 'CP002', "Producto2", '500'],
      ['a002', 'CP003', "Producto3", '800'],
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
