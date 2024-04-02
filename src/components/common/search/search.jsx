import { formatProductCode } from "@/utils";
import { useEffect, useState } from 'react';
import { Container, Search, Text } from "./styles";

const ProductSearch = ({ products, onProductSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setFilteredProducts(products?.filter((product) =>
      product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, products]);

  const handleSearchChange = (event, { value }) => {
    setSearchQuery(value);
    setSelectedProduct(null);
  };

  const handleProductSelect = (event, { result }) => {
    onProductSelect(result.value);
    setSearchQuery('');
    setSelectedProduct(result.value);
  };

  const MAX_RESULTS = 4;

  return (
    <Search
      selectFirstResult
      minCharacters={2}
      searchDelay={1000}
      onSearchChange={handleSearchChange}
      value={selectedProduct ? '' : searchQuery}
      noResultsMessage="No se encontró producto"
      placeholder="Nombre, código, marca, proveedor"
      results={filteredProducts?.slice(0, MAX_RESULTS).map((product) => ({
        key: product.code,
        title: product.name,
        description: (
          <Container>
            <Text>Código: {formatProductCode(product.code)}</Text>
            <Text>Precio: {`$ ${product?.price?.toFixed(2)}`}</Text>
          </Container>
        ),
        value: product,
      }))}
      onResultSelect={handleProductSelect}
    />
  );
};

export default ProductSearch;
