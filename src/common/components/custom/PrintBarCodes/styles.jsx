import styled from "styled-components";

const BarCodeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const BarCodeSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #000;
  text-align: center;
  page-break-inside: avoid;
  height: 300px !important;
  padding: 0px !important;
  max-width: ${({ $singleProduct }) => ($singleProduct ? "50%" : "100%")};
`;

const ProductName = styled.p`
  margin: 0;
  font-size: 16px;
  padding-top: 3px !important;
  height: 50px !important;
`;

const ProductId = styled.p`
  margin: 0;
  font-size: 16px;
  flex: 1 0 5% !important;
  padding: 3px !important;
`;

const Barcode = styled.img`
  flex: 1 0 60%;
  width: 100%;
  height: 80px !important;
  padding: 0 3px !important;
`;

export { BarCodeContainer, BarCodeSubContainer, Barcode, ProductId, ProductName };

