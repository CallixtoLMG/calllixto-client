import { ICONS } from '@/common/constants';
import { normalizeText } from '@/common/utils';
import debounce from 'lodash/debounce';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { FormField } from '../../custom';
import { Search } from './styles';

const SearchField = forwardRef(
  (
    {
      elements = [],
      onSelect,
      clearable,
      placeholder = 'Buscar...',
      noResultsMessage = 'No se encontraron resultados.',
      minCharacters = 2,
      maxResults = 16,
      extractSearchFields = (element) => [element?.name, element?.id],
      getResultProps = (element) => ({
        key: element.id,
        title: element.name,
        description: null,
        value: element,
      }),
      getDisplayValue = (element) => element?.name ?? '',
      persistSelection = false,
      label,
      width,
      required,
      disabled,
      error,
      height,
    },
    ref
  ) => {
    const [query, setQuery] = useState('');
    const [filtered, setFiltered] = useState(elements);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setQuery('');
        setSelected(null);
        setFiltered(elements);
      },
    }));

    const debouncedSearch = useCallback(
      debounce((q) => {
        const normalizedQuery = normalizeText(q);
        const queryWords = normalizedQuery.split(' ').filter(Boolean);

        const exact = [];
        const partial = [];

        elements?.forEach((element) => {
          const fields = extractSearchFields(element).map(normalizeText);
          const fieldString = fields.join(' ');

          const isExact = fields.some((f) => f.includes(normalizedQuery));
          const isPartial = queryWords.every((word) => fieldString.includes(word));

          if (isExact) exact.push(element);
          else if (isPartial) partial.push(element);
        });

        setFiltered([...exact, ...partial]);
        setLoading(false);
      }, 300),
      [elements, extractSearchFields]
    );

    useEffect(() => {
      setLoading(true);
      debouncedSearch(query);
      return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);

    const handleChange = (_, { value }) => {
      setQuery(value);
      setSelected(null);
    };

    const handleSelect = (_, { result }) => {
      onSelect(result.value);
      if (persistSelection) {
        setSelected(result.value);
        setQuery('');
      } else {
        setQuery('');
        setSelected(null);
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
          clearable ? {
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
        value={
          persistSelection
            ? (selected ? getDisplayValue(selected) : query)
            : query
        }
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
