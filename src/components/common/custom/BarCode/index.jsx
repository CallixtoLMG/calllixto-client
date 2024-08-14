import JsBarcode from "jsbarcode";
import { forwardRef, useCallback, useEffect } from "react";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductCode, ProductName } from "./styles";

const PrintBarCodes = forwardRef(({ products }, ref) => {
  const generateBarcodes = useCallback(() => {
    products?.forEach(product => {
      const barcodeElement = document.getElementById(`barcode-${product?.code}`);
      if (barcodeElement) {
        JsBarcode(barcodeElement, product?.code, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: false,
          fit: true
        });
      }
    });
  }, [products]);

  useEffect(() => {
    generateBarcodes();
  }, [generateBarcodes]);

  return (
    <BarCodeContainer ref={ref}>
      {products?.map(product => (
        <BarCodeSubContainer singleProduct={products?.length === 1} key={product?.code}>
          <ProductName>{product?.name}</ProductName>
          <Barcode id={`barcode-${product?.code}`}></Barcode>
          <ProductCode>{product?.code}</ProductCode>
        </BarCodeSubContainer>
      ))}
    </BarCodeContainer>
  );
});

PrintBarCodes.displayName = 'PrintBarCodes';

export default PrintBarCodes;