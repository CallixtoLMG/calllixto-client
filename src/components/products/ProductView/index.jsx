"use client";
import { Checkbox, FieldsContainer, FormField, Label, Segment, ViewContainer } from "@/components/common/custom";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { formatedPrice } from "@/utils";
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

const ProductView = ({ product }) => {

  const barcodeRef = useRef(null);

  useEffect(() => {
    if (product?.code && barcodeRef.current) {
      JsBarcode(barcodeRef.current, product.code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true
      });
    }
  }, [product]);

  return (
    <>
      <NoPrint>
        <ViewContainer>
          <FieldsContainer>
            <FormField width="30%">
              <Label>Proveedor</Label>
              <Segment>{product?.supplierName}</Segment>
            </FormField>
            <FormField width="30%">
              <Label>Marca</Label>
              <Segment>{product?.brandName}</Segment>
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="20%">
              <Label>Código</Label>
              <Segment>{product?.code}</Segment>
            </FormField>
            <FormField flex="1">
              <Label>Nombre</Label>
              <Segment>{product?.name}</Segment>
            </FormField>
            <FormField width="20%">
              <Label>Precio</Label>
              <Segment>{formatedPrice(product?.price)}</Segment>
            </FormField>
            <FormField>
          <Checkbox toggle checked={product?.editablePrice} label="Precio editable" disabled />
        </FormField>
      </FieldsContainer>
          <FieldsContainer>
            <Label>Comentarios</Label>
            <Segment>{product?.comments}</Segment>
          </FieldsContainer>
        </ViewContainer >
      </NoPrint>
      <OnlyPrint>
        <FieldsContainer>
          <FormField flex="1">
            <svg ref={barcodeRef}></svg>
          </FormField>
        </FieldsContainer>
      </OnlyPrint>
    </>
  );
};

export default ProductView;