import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { MainContainer, ModInput } from "./styles";

const ImportExcel = () => {
  const router = useRouter()
  const create = (product) => {
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(product),
      redirect: "follow",
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };

    fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products", requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Producto importado exitosamente");
        } else {
          toast.error(res.message);
        }
      })
      .catch(error => console.log('error', error));
    router.push(PAGES.PRODUCTS.BASE)
  };

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      parsedData.length && parsedData.forEach((product) => {
        product.code = product.code.toString();
        product.name = product.name.toString();
        product.price = Number(product.price);
        create(product)
      })
      // promiseall
    };
  }

  return (
    <MainContainer  >
      <ModInput
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
    </MainContainer>
  );
}

export default ImportExcel;