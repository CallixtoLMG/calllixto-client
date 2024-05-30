import { formatProductCode } from "@/utils";
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import { Box } from "rebass";
import { Icon, Popup } from "semantic-ui-react";
import { Container, Search, Text } from "./styles";

const ProductSearch = ({ products, onProductSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const debouncedSearch = useCallback(
    debounce((query) => {
      const queryWords = query.toLowerCase().split(' ').filter(Boolean);
      setFilteredProducts(products?.filter((product) => {
        const productName = product?.name?.toLowerCase();
        const productCode = product?.code?.toLowerCase();
        
        return queryWords.every(word => productName?.includes(word)) ||
               queryWords.every(word => productCode?.includes(word));
      }));
    }, 500), [products]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (event, { value }) => {
    setSearchQuery(value);
    setSelectedProduct(null);
  };

  const handleProductSelect = (event, { result }) => {
    onProductSelect(result.value);
    setSearchQuery('');
    setSelectedProduct(result.value);
  };

  const MAX_RESULTS = 16;

  return (
    <Search
      selectFirstResult
      minCharacters={2}
      searchDelay={1000}
      onSearchChange={handleSearchChange}
      value={selectedProduct ? '' : searchQuery}
      noResultsMessage="No se encontró producto"
      placeholder="Nombre, código"
      results={filteredProducts?.slice(0, MAX_RESULTS).map((product) => ({
        key: product.code,
        title: product.name,
        description: (
          <Container marginTop="5px" flexDir="column">
            <Text>Código: {formatProductCode(product.code)}</Text>
            <Container flexDir="row">
              <Text>Precio: {`$ ${product?.price?.toFixed(2)}`}</Text>
              {product.comments && (
                <Popup
                  size="mini"
                  content={product.comments}
                  position="top center"
                  trigger={
                    <Box marginX="5px">
                      <Icon name="info circle" color="yellow" />
                    </Box>
                  }
                />)}
            </Container>
          </Container>
        ),
        value: product,
      }))}
      onResultSelect={handleProductSelect}
    />
  );
};

export default ProductSearch;
