import { Icon } from "semantic-ui-react";
import * as XLSX from 'xlsx';
import { ModButton } from "./styles";

const ButtonDownload = () => {
  const handleDownload = () => {
    const mockData = [
      ['Codigo', 'Nombre', 'Precio'],
      ['a000', "Producto1", '200'],
      ['a001', "Producto2", '500'],
      ['a002', "Producto3", '800'],
    ];
  
    const ws = XLSX.utils.aoa_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
  
    XLSX.writeFile(wb, 'Ejemplo de Tabla.xlsx');
  };
  return (
    <ModButton compact onClick={handleDownload} color='blue' content={<Icon name="download" />} >Descargar Excel</ModButton>
  )
};

export default ButtonDownload;

