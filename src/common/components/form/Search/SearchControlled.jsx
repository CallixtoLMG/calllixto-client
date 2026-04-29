import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import SearchField from './SearchField';

export const SearchControlled = forwardRef(({
  name,
  rules,
  label,
  placeholder,
  onAfterChange,
  onQueryChange,
  clearAfterSelect,
  externalError,
  resultRenderer,
  ...rest
}, ref) => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <SearchField
          ref={ref}
          {...rest}
          label={label}
          error={
            externalError ||
            (errors?.[name] && {
              content: errors[name].message,
              pointing: 'above',
            })
          }
          value={value}
          onAfterChange={onAfterChange}
          onQueryChange={onQueryChange}
          onSelect={(val) => {
            onChange(val);
          }}
          placeholder={placeholder ?? label}
          clearAfterSelect={clearAfterSelect}
          resultRenderer={resultRenderer}
        />
      )}
    />
  );
});

SearchControlled.displayName = 'SearchControlled';
