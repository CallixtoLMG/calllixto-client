import { useEffect, useState } from 'react';
import { Container, Search, Text } from "./styles";

const ProductSearch = ({ products, onProductSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    setFilteredProducts(products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplierCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, products]);

  const handleSearchChange = (event, { value }) => {
    setSearchQuery(value);
  };

  const handleProductSelect = (event, value) => {
    onProductSelect(value.result.value);
    setSearchQuery(''); 
  };
  const MAX_RESULTS = 5;

  return (
    <Search
      selectFirstResult
      minCharacters={1}
      searchDelay={1000}
      onSearchChange={handleSearchChange}
      placeholder='Productos'
      results={filteredProducts.slice(0, MAX_RESULTS).map((product) => ({
        key: product.code,
        title: product.name,
        description: (
          <Container>
            <Text>Código: {product.code}</Text>
            <Text>Proveedor: {product.supplierName}</Text>
            <Text>Marca: {product.brandName}</Text>
          </Container>
        ),
        value: product,
      }))}
      onResultSelect={handleProductSelect}
    />
  );
};

export default ProductSearch;
