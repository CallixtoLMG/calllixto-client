import JsBarcode from "jsbarcode";
import { forwardRef, useEffect } from "react";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductId, ProductName } from "./styles";

const PrintBarCodes = forwardRef(({ products }, ref) => {
  useEffect(() => {
    const generateBarcodes = () => {
      products?.forEach(product => {
        const barcodeElement = document.getElementById(`barcode-${product?.id}`);
        if (barcodeElement) {
          JsBarcode(barcodeElement, product?.id, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 80,
            displayValue: false,
            fit: true
          });
        }
      });
    };

    generateBarcodes();
  }, [products]);

  return (
    <BarCodeContainer ref={ref}>
      {products?.map(product => (
        <BarCodeSubContainer $singleProduct={products?.length === 1} key={product?.id}>
          <ProductName>{product?.name}</ProductName>
          <Barcode id={`barcode-${product?.id}`}></Barcode>
          <ProductId>{product?.id}</ProductId>
        </BarCodeSubContainer>
      ))}
    </BarCodeContainer>
  );
});

PrintBarCodes.displayName = 'PrintBarCodes';

export default PrintBarCodes;