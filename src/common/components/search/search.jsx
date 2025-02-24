import { COLORS } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { formatProductCode } from "@/components/products/products.utils";
import debounce from 'lodash/debounce';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Flex, FlexColumn, Label } from "../custom";
import { CommentTooltip, TagsTooltip } from "../tooltips";
import { Search, Text } from "./styles";

const ProductSearch = forwardRef(({ products, onProductSelect, tooltip }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setSearchQuery('');
      setSelectedProduct(null);
      setFilteredProducts(products);
    }
  }));

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
          <FlexColumn marginTop="5px" rowGap="5px">
            <FlexColumn >
              <Text>Código: {formatProductCode(product.code)}</Text>
              <Text>Precio: {getFormatedPrice(product?.price)}</Text>
            </FlexColumn>
            <Flex width="100%" justifyContent="space-between" height="20px" marginTop="auto" columnGap="5px" alignItems="center">
              {product.state === PRODUCT_STATES.OOS.id ? <Label width="fit-content" size="tiny" color={COLORS.ORANGE}>Sin Stock</Label> : <Flex marginLeft="20px" />}
              {product.tags ? <TagsTooltip tooltip={tooltip} tags={product.tags} /> : <Flex />}
              {product.comments ? <CommentTooltip tooltip={tooltip} comment={product.comments} /> : <Flex height="1rem" />}
            </Flex>
          </FlexColumn>
        ),
        value: product,
      }))}
      onResultSelect={handleProductSelect}
    />
  );
});

ProductSearch.displayName = 'ProductSearch';

export default ProductSearch;
