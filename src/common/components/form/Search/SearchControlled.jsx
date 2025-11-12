import { Controller, useFormContext } from 'react-hook-form';
import SearchField from './SearchField';

const SearchControlled = ({
  name,
  rules,
  label,
  width,
  required,
  disabled,
  placeholder,
  elements,
  clearable,
  extractSearchFields,
  getResultProps,
  onAfterChange,
  onClear,
  value,
  ...rest
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <SearchField
          {...rest}
          clearable={clearable}
          label={label}
          required={required}
          width={width}
          error={errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
          elements={elements}
          value={value}
          onSelect={(val) => {
            onChange(val);
            onAfterChange?.(val);
          }}
          disabled={disabled}
          placeholder={placeholder ?? label}
          extractSearchFields={extractSearchFields}
          getResultProps={getResultProps}
        />
      )}
    />
  );
};

export default SearchControlled;