import { COLORS } from "@/common/constants";
import { getFormatedPrice, normalizeText } from "@/common/utils";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { formatProductCode } from "@/components/products/products.utils";
import debounce from 'lodash/debounce';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Box, Flex, FlexColumn, Label, OverflowWrapper } from "../custom";
import { CommentTooltip, TagsTooltip } from "../tooltips";
import { Search, Text } from "./styles";

const ProductSearch = forwardRef(({ products, onProductSelect }, ref) => {
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
      const normalizedQuery = normalizeText(query);
      const queryWords = normalizedQuery.split(' ').filter(Boolean);

      const exactMatches = [];
      const partialMatches = [];

      products?.forEach(product => {
        const name = normalizeText(product?.name);
        const code = normalizeText(product?.code);

        const exactMatch = name.includes(normalizedQuery) || code.includes(normalizedQuery);
        const partialMatch = queryWords.every(word =>
          name.includes(word) || code.includes(word)
        );

        if (exactMatch) {
          exactMatches.push(product);
        } else if (partialMatch) {
          partialMatches.push(product);
        }
      });

      setFilteredProducts([...exactMatches, ...partialMatches]);
      setLoading(false);
    }, 300),
    [products]
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
      loading={loading}
      onSearchChange={handleSearchChange}
      value={selectedProduct ? '' : searchQuery}
      noResultsMessage="No se encontró producto"
      placeholder="Nombre, código"
      results={filteredProducts?.slice(0, MAX_RESULTS).map((product) => ({
        key: product.code,
        title: (
          <OverflowWrapper popupContent={product.name}>
            {product.name}
          </OverflowWrapper>
        ),
        description: (
          <FlexColumn $marginTop="5px" $rowGap="5px">
            <FlexColumn>
              <Text>Código: {formatProductCode(product.code)}</Text>
              <Text>Precio: {getFormatedPrice(product?.price)}</Text>
            </FlexColumn>
            <Flex width="100%" $justifyContent="space-between" height="20px" $marginTop="auto" $columnGap="5px" $alignItems="center">
              <Flex $columnGap="7px">
                {product.state === PRODUCT_STATES.OOS.id && (
                  <Label width="fit-content" size="tiny" color={COLORS.ORANGE}>Sin Stock</Label>
                )}
                {product.tags && <TagsTooltip maxWidthOverflow="5vw" tooltip="true" tags={product.tags} />}
              </Flex>
              <Box width="fit-content">
                {product.comments ? <CommentTooltip comment={product.comments} /> : <Box visibility="hidden" />}
              </Box>
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
