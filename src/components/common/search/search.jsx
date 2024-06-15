import { formatProductCode } from "@/utils";
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import { Container, Search, Text } from "./styles";
import { CommentTooltip } from "../tooltips";

const ProductSearch = ({ products, onProductSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query) => {
      const queryWords = query.toLowerCase().split(' ').filter(Boolean);
      setFilteredProducts(products?.filter((product) => {
        const name = product?.name?.toLowerCase();
        const code = product?.code?.toLowerCase();
        return queryWords.every(word => name?.includes(word)) || code?.includes(query.toLowerCase());
      }));
      setLoading(false);
    }, 300), [products]
  );

  useEffect(() => {
    setLoading(true);
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
      loading={loading}
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
              {product.comments && <CommentTooltip comment={product.comments} />}
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
