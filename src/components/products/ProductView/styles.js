import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #000;
  text-align: center;
  page-break-inside: avoid;
  height: 300!important;
  padding: 0px!important;
  max-width: 50%;
`;

const ProductName = styled.p`
  margin: 0;
  font-size: 16px;
  padding-top : 3px!important;
  height: 50px!important;
`;

const ProductCode = styled.p`
  margin: 0;
  font-size: 16px;
  flex: 1 0 5%!important; 
  padding: 3px!important;
`;

const Barcode = styled.img`
  flex: 1 0 60%; 
  width: 100%;
  height: 80px!important;
  padding: 0 3px!important;
`;

export {
  Barcode, Container, ProductCode, ProductName, SubContainer
};

