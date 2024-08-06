import JsBarcode from "jsbarcode";
import { forwardRef, useCallback, useEffect } from "react";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductCode, ProductName } from "./styles";

const PrintBarCodes = forwardRef(({ products }, ref) => {
  const generateBarcodes = useCallback(() => {
    const productsArray = Array.isArray(products) ? products : [products];

    productsArray?.forEach(product => {
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

  const productsArray = Array.isArray(products) ? products : [products];
  const singleProduct = productsArray.length === 1;

  return (
    <BarCodeContainer ref={ref}>
      {productsArray?.map(product => (
        <BarCodeSubContainer singleProduct={singleProduct} key={product?.code}>
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