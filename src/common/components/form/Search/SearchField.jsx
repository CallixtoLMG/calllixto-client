import { ICONS } from '@/common/constants';
import { normalizeText } from '@/common/utils';
import { debounce, get } from 'lodash';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { FormField } from '../../custom';
import { Search } from './styles';

const SearchField = forwardRef(
  (
    {
      value,
      elements = [],
      onSelect,
      clearable,
      placeholder = 'Buscar...',
      noResultsMessage = 'No se encontraron resultados.',
      minCharacters = 2,
      maxResults = 16,
      searchFields = ['name', 'id'],
      getResultProps = (element) => ({
        key: element.id,
        title: element.name,
        description: null,
        value: element,
      }),
      getDisplayValue = (element) => element?.name ?? '',
      label,
      width,
      required,
      disabled,
      error,
      height,
      clearAfterSelect,
    },
    ref
  ) => {
    const [query, setQuery] = useState('');
    const [filtered, setFiltered] = useState(elements);
    const [selected, setSelected] = useState(value ?? null);
    const [loading, setLoading] = useState(false);

    const fields = useMemo(() => searchFields.map(normalizeText), [searchFields]);
    const matchesOnSomeField = useCallback((element, word) => {
      return fields.some(field => normalizeText(get(element, field)).includes(word))
    }, [fields]);

    useEffect(() => {
      setLoading(true);

      const debouncedSearch = debounce(() => {
        const normalizedQuery = normalizeText(query);
        const queryWords = normalizedQuery.split(' ').filter(Boolean);

        const exact = [];
        const partial = [];

        elements.forEach((element) => {
          const isExact = matchesOnSomeField(element, normalizedQuery);
          const isPartial = queryWords.every(word => matchesOnSomeField(element, word));

          if (isExact) exact.push(element);
          else if (isPartial) partial.push(element);
        });

        setFiltered([...exact, ...partial]);
        setLoading(false);
      }, 300);

      debouncedSearch();

      return () => debouncedSearch.cancel();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elements, query]);

    const handleChange = (_, { value }) => {
      setQuery(value);
      setSelected(null);
    };

    const handleSelect = (_, { result }) => {
      onSelect(result.value);
    
      if (clearAfterSelect) {
        setSelected(null);
        setQuery('');
      } else {
        setSelected(result.value);
      }
    };

    const handleClear = () => {
      setQuery('');
      setSelected(null);
      onSelect(null);
    };

    return (
      <FormField
        $width={width}
        icon={
          clearable && selected ? {
            name: ICONS.CLOSE,
            link: true,
            onClick: handleClear,
          } : {}}
        height={height}
        required={required}
        label={label}
        placeholder={placeholder ?? label}
        search
        minCharacters={minCharacters}
        noResultsMessage={noResultsMessage}
        control={Search}
        loading={loading}
        results={filtered.slice(0, maxResults).map(getResultProps)}
        value={selected ? getDisplayValue(selected) : query}
        onSearchChange={handleChange}
        onResultSelect={handleSelect}
        disabled={disabled}
        error={error}
      />
    );
  }
);

SearchField.displayName = 'SearchField';

export default SearchField;